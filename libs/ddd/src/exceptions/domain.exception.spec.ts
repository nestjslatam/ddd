import {
  ArgumentNullException,
  DomainException,
  InvalidFormatException,
  InvalidOperationException,
  InvalidStateTransitionException,
  NoTransitionsDefinedException,
} from './domain.exception';

/**
 * Estas excepciones cruzan la frontera de la librería: los consumidores las
 * capturan por `instanceof` y muestran su `message` al usuario final. Por eso
 * los mensajes se verifican con cadenas exactas y no con `toContain`: un cambio
 * de redacción es un cambio de contrato observable.
 */
describe('domain.exception', () => {
  describe('jerarquía', () => {
    // Cada subclase debe seguir siendo capturable tanto por su propio tipo como
    // por el tipo base y por Error; romper esta cadena deja los catch de los
    // consumidores sin capturar nada y el error escapa hasta el proceso.
    const subclasses: Array<[string, () => DomainException]> = [
      ['ArgumentNullException', () => new ArgumentNullException('userId')],
      [
        'InvalidOperationException',
        () => new InvalidOperationException('nope'),
      ],
      [
        'InvalidStateTransitionException',
        () => new InvalidStateTransitionException('Draft', 'Archived'),
      ],
      [
        'NoTransitionsDefinedException',
        () => new NoTransitionsDefinedException('Draft'),
      ],
      [
        'InvalidFormatException',
        () => new InvalidFormatException('email', 'RFC 5322'),
      ],
    ];

    it.each(subclasses)(
      '%s debe ser instancia de sí misma, de DomainException y de Error',
      (_name, factory) => {
        const error = factory();

        expect(error).toBeInstanceOf(DomainException);
        expect(error).toBeInstanceOf(Error);
      },
    );

    it.each(subclasses)(
      '%s debe exponer name con el nombre de su clase concreta y no "Error"',
      (name, factory) => {
        const error = factory();

        expect(error.name).toBe(name);
        // Regresión clásica: si se elimina `this.name = this.constructor.name`
        // del constructor base, todas heredan el name "Error" y los logs dejan
        // de distinguir un argumento nulo de una transición inválida.
        expect(error.name).not.toBe('Error');
      },
    );

    it('debe mantener las subclases distinguibles entre sí por instanceof', () => {
      const argumentNull = new ArgumentNullException('userId');
      const invalidOperation = new InvalidOperationException('nope');

      expect(argumentNull).not.toBeInstanceOf(InvalidOperationException);
      expect(invalidOperation).not.toBeInstanceOf(ArgumentNullException);
      expect(new InvalidStateTransitionException('A', 'B')).not.toBeInstanceOf(
        NoTransitionsDefinedException,
      );
    });

    it('debe ser capturable con toThrow tanto por la subclase como por la base', () => {
      const thrower = () => {
        throw new ArgumentNullException('userId');
      };

      expect(thrower).toThrow(ArgumentNullException);
      expect(thrower).toThrow(Error);
      expect(thrower).toThrow('userId cannot be null or undefined');

      // `toThrow` no acepta un constructor abstracto, así que el catch por la
      // base —que es como filtran los consumidores— se comprueba a mano.
      let caught: unknown;
      try {
        thrower();
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(DomainException);
    });

    it('debe permitir a un consumidor derivar su propia excepción y conservar su name', () => {
      // El contrato documentado de la librería es que las apps declaren sus
      // propias excepciones de dominio sobre esta base; `this.constructor.name`
      // debe resolver a la clase más derivada, no a la intermedia.
      class OrderAlreadyPaidException extends InvalidOperationException {
        constructor(orderId: string) {
          super(`Order ${orderId} is already paid`);
        }
      }

      const error = new OrderAlreadyPaidException('ORD-1');

      expect(error.name).toBe('OrderAlreadyPaidException');
      expect(error.message).toBe('Order ORD-1 is already paid');
      expect(error).toBeInstanceOf(InvalidOperationException);
      expect(error).toBeInstanceOf(DomainException);
    });
  });

  describe('stack trace', () => {
    it('debe empezar por "Name: message" para que el log sea legible', () => {
      const error = new ArgumentNullException('userId');

      expect(error.stack).toBeDefined();
      expect(error.stack.split('\n')[0]).toBe(
        'ArgumentNullException: userId cannot be null or undefined',
      );
    });

    it('debe apuntar al código que construyó la excepción, no al fichero de excepciones', () => {
      const error = new NoTransitionsDefinedException('Draft');
      const firstFrame = error.stack.split('\n')[1];

      // Contrato de depuración: el primer frame es la línea del dominio que
      // falló. Nota: en V8 esto se cumple aunque se quite
      // `Error.captureStackTrace`, porque el motor ya omite los frames de los
      // constructores hasta `new.target`; la llamada del constructor base es
      // redundante aquí (y es lo que ata la librería a V8, ver hallazgo).
      expect(firstFrame).toContain('domain.exception.spec.ts');
      expect(error.stack).not.toContain('/domain.exception.ts');
    });
  });

  describe('forma serializada', () => {
    it('debe exponer name como propiedad propia y enumerable, pero no message', () => {
      const error = new InvalidFormatException('email', 'RFC 5322', 'nope');

      // Comportamiento sorprendente y relevante en producción: al asignarse en
      // el constructor, `name` es propiedad propia enumerable, mientras que
      // `message` y `stack` siguen siendo no enumerables (herencia de Error).
      // Por eso JSON.stringify de una excepción de dominio pierde el mensaje;
      // quien serialice estos errores debe copiarlo a mano.
      expect(Object.prototype.hasOwnProperty.call(error, 'name')).toBe(true);
      expect(Object.keys(error)).toEqual(['name']);
      expect(JSON.parse(JSON.stringify(error))).toEqual({
        name: 'InvalidFormatException',
      });
      // El mensaje sí está accesible por la vía normal.
      expect(error.message).toBe(
        "email has an invalid format. Expected: RFC 5322. Provided value: 'nope'",
      );
    });
  });

  describe('ArgumentNullException', () => {
    it('debe componer el mensaje a partir del nombre del parámetro', () => {
      expect(new ArgumentNullException('userId').message).toBe(
        'userId cannot be null or undefined',
      );
    });

    it('debe respetar rutas de parámetro compuestas usadas por StateTransitionManager', () => {
      // StateTransitionManager pasa descripciones como "sourceState in
      // transitions map"; el mensaje no debe reformatear ni recortar nada.
      expect(
        new ArgumentNullException('sourceState in transitions map').message,
      ).toBe('sourceState in transitions map cannot be null or undefined');
    });

    it('debe seguir construyendo con un nombre de parámetro vacío', () => {
      // Caso borde defensivo: el constructor no valida su propia entrada, así
      // que un nombre vacío produce un mensaje degradado pero nunca lanza.
      expect(() => new ArgumentNullException('')).not.toThrow();
      expect(new ArgumentNullException('').message).toBe(
        ' cannot be null or undefined',
      );
    });
  });

  describe('InvalidOperationException', () => {
    it('debe propagar el mensaje recibido sin decorarlo', () => {
      const message = 'Cannot ship an order that has no lines';

      expect(new InvalidOperationException(message).message).toBe(message);
    });

    it('debe aceptar un mensaje vacío sin lanzar', () => {
      const error = new InvalidOperationException('');

      expect(error.message).toBe('');
      expect(error.name).toBe('InvalidOperationException');
    });
  });

  describe('InvalidStateTransitionException', () => {
    it('debe nombrar el estado origen y el destino en el mensaje', () => {
      expect(
        new InvalidStateTransitionException('Draft', 'Archived').message,
      ).toBe(
        "Invalid state transition from 'Draft' to 'Archived'. " +
          'This transition is not defined in the valid transitions map.',
      );
    });

    it('debe distinguir el orden de los estados', () => {
      // El mensaje se lee para diagnosticar la máquina de estados: invertir los
      // argumentos en el constructor apuntaría al arco equivocado.
      const forward = new InvalidStateTransitionException('Draft', 'Archived');
      const backward = new InvalidStateTransitionException('Archived', 'Draft');

      expect(forward.message).not.toBe(backward.message);
      expect(backward.message).toContain("from 'Archived' to 'Draft'");
    });

    it('debe entrecomillar estados vacíos para que se vean en el log', () => {
      expect(new InvalidStateTransitionException('', '').message).toBe(
        "Invalid state transition from '' to ''. " +
          'This transition is not defined in the valid transitions map.',
      );
    });
  });

  describe('NoTransitionsDefinedException', () => {
    it('debe nombrar el estado e indicar la acción correctiva', () => {
      expect(new NoTransitionsDefinedException('Draft').message).toBe(
        "No transitions defined for state 'Draft'. " +
          'Define transitions first using defineTransitions().',
      );
    });

    it('debe conservar el nombre de estado tal cual, incluidos valores no alfabéticos', () => {
      // StateTransitionManager deriva el nombre de estado de enums numéricos,
      // por lo que aquí puede llegar "0" o "undefined" como texto.
      expect(new NoTransitionsDefinedException('0').message).toContain(
        "state '0'",
      );
    });
  });

  describe('InvalidFormatException', () => {
    it('debe incluir el valor recibido cuando se proporciona', () => {
      expect(
        new InvalidFormatException('email', 'user@domain.tld', 'not-an-email')
          .message,
      ).toBe(
        "email has an invalid format. Expected: user@domain.tld. Provided value: 'not-an-email'",
      );
    });

    it('debe omitir el fragmento del valor cuando no se proporciona', () => {
      // El tercer parámetro es opcional: sin él el mensaje termina en el punto
      // del formato esperado, sin espacio ni comillas colgando.
      expect(
        new InvalidFormatException('email', 'user@domain.tld').message,
      ).toBe('email has an invalid format. Expected: user@domain.tld.');
    });

    it('debe tratar undefined explícito igual que la ausencia del argumento', () => {
      expect(
        new InvalidFormatException('email', 'user@domain.tld', undefined)
          .message,
      ).toBe(new InvalidFormatException('email', 'user@domain.tld').message);
    });

    it('debe incluir valores numéricos en texto que no son cadenas vacías', () => {
      expect(
        new InvalidFormatException('age', 'a positive integer', '0').message,
      ).toBe(
        "age has an invalid format. Expected: a positive integer. Provided value: '0'",
      );
    });
  });
});
