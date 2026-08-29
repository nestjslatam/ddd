import { readFileSync } from 'fs';
import { join } from 'path';

import {
  ArgumentNullException,
  InvalidStateTransitionException,
  NoTransitionsDefinedException,
} from './exceptions/domain.exception';
import {
  StateEqualityComparator,
  StateTransitionManager,
} from './state-transition.manager';

/**
 * Estado de dominio típico: no redefine toString(), así que el manager lo
 * identifica por la propiedad `name`.
 */
class Status {
  constructor(public readonly name: string) {}
}

const Draft = new Status('DRAFT');
const Pending = new Status('PENDING');
const Confirmed = new Status('CONFIRMED');
const Shipped = new Status('SHIPPED');
const Cancelled = new Status('CANCELLED');

/** Comparador por valor: dos instancias distintas con el mismo nombre son el mismo estado. */
const byName: StateEqualityComparator<Status> = (s1, s2) => s1.name === s2.name;

/**
 * Grafo de referencia. Draft/Pending/Confirmed son estados origen;
 * Shipped y Cancelled son terminales (solo aparecen como destino).
 * Se construye en una función para que cada test reciba un Map fresco y
 * nadie contamine al siguiente.
 */
function orderFlow(): Map<Status, Status[]> {
  return new Map<Status, Status[]>([
    [Draft, [Pending, Cancelled]],
    [Pending, [Confirmed, Cancelled]],
    [Confirmed, [Shipped]],
  ]);
}

describe('StateTransitionManager', () => {
  let manager: StateTransitionManager<Status>;

  beforeEach(() => {
    manager = new StateTransitionManager<Status>();
  });

  describe('constructor', () => {
    it('debe usar igualdad por referencia cuando no se pasa comparador', () => {
      manager.defineTransitions(orderFlow());

      // Un clon estructural NO es el mismo estado bajo el comparador por defecto.
      // Si alguien cambiase el default a igualdad estructural, este test lo detecta.
      expect(() =>
        manager.canTransitionTo(new Status('DRAFT'), Pending),
      ).toThrow(NoTransitionsDefinedException);
    });

    it('debe usar el comparador personalizado cuando se proporciona', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);
      byValueManager.defineTransitions(orderFlow());

      expect(
        byValueManager.canTransitionTo(
          new Status('DRAFT'),
          new Status('PENDING'),
        ),
      ).toBe(true);
    });

    it('no debe compartir estado entre instancias', () => {
      const other = new StateTransitionManager<Status>();
      manager.defineTransitions(orderFlow());

      expect(other.hasTransitions()).toBe(false);
      expect(other.getAllStates()).toHaveLength(0);
    });
  });

  describe('defineTransitions', () => {
    it('debe lanzar ArgumentNullException si el mapa es null', () => {
      expect(() => manager.defineTransitions(null as any)).toThrow(
        ArgumentNullException,
      );
      expect(() => manager.defineTransitions(null as any)).toThrow(
        'transitions cannot be null or undefined',
      );
    });

    it('debe lanzar ArgumentNullException si el mapa es undefined', () => {
      expect(() => manager.defineTransitions(undefined as any)).toThrow(
        'transitions cannot be null or undefined',
      );
    });

    it('debe rechazar un mapa vacío', () => {
      expect(() => manager.defineTransitions(new Map())).toThrow(
        'Transitions map cannot be empty. Provide at least one state transition.',
      );
    });

    it('debe rechazar una clave origen null', () => {
      const transitions = new Map<any, Status[]>([[null, [Pending]]]);

      expect(() => manager.defineTransitions(transitions)).toThrow(
        'sourceState in transitions map cannot be null or undefined',
      );
    });

    it('debe rechazar destinos null nombrando el estado origen', () => {
      const transitions = new Map<Status, any>([[Draft, null]]);

      // El mensaje debe identificar QUÉ entrada está mal; sin el nombre el error
      // es inútil en un grafo de veinte estados.
      expect(() => manager.defineTransitions(transitions)).toThrow(
        "targetStates for state 'DRAFT' cannot be null or undefined",
      );
    });

    it('debe rechazar destinos que no sean un array', () => {
      const transitions = new Map<Status, any>([[Draft, 'PENDING']]);

      expect(() => manager.defineTransitions(transitions)).toThrow(
        "Target states for 'DRAFT' must be an array",
      );
    });

    it('debe rechazar un array de destinos vacío', () => {
      const transitions = new Map<Status, Status[]>([[Draft, []]]);

      expect(() => manager.defineTransitions(transitions)).toThrow(
        /Target states array for 'DRAFT' cannot be empty/,
      );
    });

    it('debe rechazar un destino null indicando su índice', () => {
      const transitions = new Map<Status, any[]>([
        [Draft, [Pending, null, Cancelled]],
      ]);

      expect(() => manager.defineTransitions(transitions)).toThrow(
        "targetState at index 1 for source state 'DRAFT' cannot be null or undefined",
      );
    });

    it('debe rechazar un destino undefined indicando su índice', () => {
      const transitions = new Map<Status, any[]>([[Draft, [undefined]]]);

      expect(() => manager.defineTransitions(transitions)).toThrow(
        "targetState at index 0 for source state 'DRAFT' cannot be null or undefined",
      );
    });

    it('debe reemplazar, no fusionar, las transiciones previas', () => {
      manager.defineTransitions(orderFlow());
      manager.defineTransitions(
        new Map<Status, Status[]>([[Draft, [Shipped]]]),
      );

      expect(manager.getAllStates()).toEqual([Draft]);
      expect(manager.getValidTransitions(Draft)).toEqual([Shipped]);
      expect(manager.hasTransitionsDefined(Pending)).toBe(false);
    });

    it('debe validar todo el mapa ANTES de descartar las transiciones vigentes', () => {
      manager.defineTransitions(orderFlow());

      expect(() =>
        manager.defineTransitions(new Map<Status, Status[]>([[Draft, []]])),
      ).toThrow();

      // Una redefinición fallida no puede dejar el manager vacío: el agregado
      // seguiría vivo y de golpe cualquier transición lanzaría NoTransitionsDefined.
      expect(manager.hasTransitions()).toBe(true);
      expect(manager.canTransitionTo(Draft, Pending)).toBe(true);
    });

    it('debe copiar los arrays de destino (mutar el original no afecta al manager)', () => {
      const targets = [Pending];
      manager.defineTransitions(new Map<Status, Status[]>([[Draft, targets]]));

      targets.push(Shipped);

      expect(manager.canTransitionTo(Draft, Shipped)).toBe(false);
      expect(manager.getValidTransitions(Draft)).toEqual([Pending]);
    });

    it('debe copiar las entradas del mapa (mutar el original no afecta al manager)', () => {
      const transitions = orderFlow();
      manager.defineTransitions(transitions);

      transitions.set(Shipped, [Draft]);
      transitions.delete(Draft);

      expect(manager.hasTransitionsDefined(Shipped)).toBe(false);
      expect(manager.hasTransitionsDefined(Draft)).toBe(true);
    });

    it('debe aceptar auto-transiciones', () => {
      manager.defineTransitions(new Map<Status, Status[]>([[Draft, [Draft]]]));

      expect(manager.canTransitionTo(Draft, Draft)).toBe(true);
    });

    it('debe rechazar dos orígenes lógicamente iguales en lugar de silenciar el segundo', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);

      // El Map indexa por identidad: dos instancias distintas de DRAFT son dos
      // entradas. Toda búsqueda se detiene en la primera coincidencia, así que
      // la segunda quedaba muerta y sus destinos desaparecían sin aviso.
      const transitions = new Map<Status, Status[]>([
        [new Status('DRAFT'), [Pending]],
        [new Status('DRAFT'), [Cancelled]],
      ]);

      expect(() => byValueManager.defineTransitions(transitions)).toThrow(
        /Duplicate source state 'DRAFT'/,
      );
    });

    it('debe detectar orígenes duplicados ANTES de descartar las transiciones vigentes', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);
      byValueManager.defineTransitions(orderFlow());

      expect(() =>
        byValueManager.defineTransitions(
          new Map<Status, Status[]>([
            [new Status('PENDING'), [Confirmed]],
            [new Status('PENDING'), [Cancelled]],
          ]),
        ),
      ).toThrow();

      expect(byValueManager.canTransitionTo(Draft, Pending)).toBe(true);
    });

    it('no debe considerar duplicados dos orígenes con nombres distintos', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);

      expect(() => byValueManager.defineTransitions(orderFlow())).not.toThrow();
      expect(byValueManager.getAllStates()).toHaveLength(3);
    });
  });

  describe('canTransitionTo', () => {
    beforeEach(() => {
      manager.defineTransitions(orderFlow());
    });

    it('debe lanzar ArgumentNullException si currentState es null', () => {
      expect(() => manager.canTransitionTo(null as any, Pending)).toThrow(
        'currentState cannot be null or undefined',
      );
    });

    it('debe lanzar ArgumentNullException si newState es null', () => {
      expect(() => manager.canTransitionTo(Draft, null as any)).toThrow(
        'newState cannot be null or undefined',
      );
    });

    it('debe lanzar ArgumentNullException si newState es undefined', () => {
      expect(() => manager.canTransitionTo(Draft, undefined as any)).toThrow(
        ArgumentNullException,
      );
    });

    it('debe validar currentState antes que newState', () => {
      // El orden importa para el diagnóstico: con ambos nulos el mensaje debe
      // señalar el primer parámetro, no el segundo.
      expect(() => manager.canTransitionTo(null as any, null as any)).toThrow(
        'currentState cannot be null or undefined',
      );
    });

    it('debe devolver true para una transición declarada', () => {
      expect(manager.canTransitionTo(Draft, Pending)).toBe(true);
      expect(manager.canTransitionTo(Draft, Cancelled)).toBe(true);
      expect(manager.canTransitionTo(Confirmed, Shipped)).toBe(true);
    });

    it('debe devolver false para una transición no declarada', () => {
      expect(manager.canTransitionTo(Draft, Confirmed)).toBe(false);
      expect(manager.canTransitionTo(Draft, Shipped)).toBe(false);
    });

    it('debe devolver false para una transición inversa', () => {
      // El grafo es dirigido: Pending -> Confirmed no implica Confirmed -> Pending.
      expect(manager.canTransitionTo(Pending, Confirmed)).toBe(true);
      expect(manager.canTransitionTo(Confirmed, Pending)).toBe(false);
    });

    it('debe lanzar NoTransitionsDefinedException para un estado terminal', () => {
      // OJO: un método llamado canTransitionTo que devuelve boolean LANZA cuando
      // el estado no tiene entrada en el mapa, en lugar de devolver false.
      // Es el comportamiento documentado, pero contrasta con getValidTransitions,
      // que para el mismo estado devuelve [] sin lanzar.
      expect(() => manager.canTransitionTo(Shipped, Draft)).toThrow(
        NoTransitionsDefinedException,
      );
      expect(() => manager.canTransitionTo(Shipped, Draft)).toThrow(
        "No transitions defined for state 'SHIPPED'",
      );
    });

    it('debe lanzar NoTransitionsDefinedException tras clear()', () => {
      manager.clear();

      expect(() => manager.canTransitionTo(Draft, Pending)).toThrow(
        NoTransitionsDefinedException,
      );
    });

    it('debe lanzar NoTransitionsDefinedException si nunca se definieron transiciones', () => {
      const virgin = new StateTransitionManager<Status>();

      expect(() => virgin.canTransitionTo(Draft, Pending)).toThrow(
        NoTransitionsDefinedException,
      );
    });

    it('debe resolver origen y destino con el comparador personalizado', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);
      byValueManager.defineTransitions(orderFlow());

      // Ambos extremos son clones: si sólo uno de los dos usara el comparador,
      // este test fallaría.
      expect(
        byValueManager.canTransitionTo(
          new Status('PENDING'),
          new Status('CONFIRMED'),
        ),
      ).toBe(true);
      expect(
        byValueManager.canTransitionTo(
          new Status('PENDING'),
          new Status('SHIPPED'),
        ),
      ).toBe(false);
    });
  });

  describe('contrato del comparador: orden de argumentos', () => {
    // El comparador se invoca SIEMPRE como (estadoDeclarado, estadoConsultado).
    // Antes el orden se partía dentro de una misma llamada: la búsqueda de la
    // clave origen preguntaba comparator(key, currentState) y el match del
    // destino comparator(newState, target). Con un comparador asimétrico
    // -- comodines, subtipos, patrones -- una sola llamada a canTransitionTo
    // hacía dos preguntas espejo y obtenía respuestas incoherentes.

    /** '*' declarado en el grafo acepta cualquier consulta; consultar '*' no. */
    const wildcardAware: StateEqualityComparator<Status> = (defined, query) =>
      defined.name === '*' || defined.name === query.name;

    const Wildcard = new Status('*');

    it('debe pasar el estado del grafo primero y el del llamador segundo, en todas las búsquedas', () => {
      const calls: Array<[Status, Status]> = [];
      const recording: StateEqualityComparator<Status> = (defined, query) => {
        calls.push([defined, query]);
        return defined.name === query.name;
      };
      const byValueManager = new StateTransitionManager<Status>(recording);
      byValueManager.defineTransitions(orderFlow());

      const graphStates = [Draft, Pending, Confirmed, Shipped, Cancelled];
      const from = new Status('PENDING');
      const to = new Status('CONFIRMED');

      calls.length = 0;
      expect(byValueManager.canTransitionTo(from, to)).toBe(true);

      expect(calls.length).toBeGreaterThan(0);
      for (const [defined, query] of calls) {
        expect(graphStates).toContain(defined);
        expect([from, to]).toContain(query);
      }
    });

    it('debe resolver el destino con el comodín declarado en el grafo', () => {
      const byValueManager = new StateTransitionManager<Status>(wildcardAware);
      byValueManager.defineTransitions(
        new Map<Status, Status[]>([[Draft, [Wildcard]]]),
      );

      // El destino declarado es '*': acepta cualquier estado consultado.
      expect(byValueManager.canTransitionTo(Draft, Shipped)).toBe(true);
      expect(byValueManager.canTransitionTo(Draft, Cancelled)).toBe(true);
    });

    it('debe resolver el origen con el mismo criterio que el destino', () => {
      const byValueManager = new StateTransitionManager<Status>(wildcardAware);
      byValueManager.defineTransitions(
        new Map<Status, Status[]>([[Wildcard, [Shipped]]]),
      );

      // Origen y destino deben responder a la MISMA pregunta: si el comodín
      // vale como clave origen, tiene que valer también como destino.
      expect(byValueManager.canTransitionTo(Draft, Shipped)).toBe(true);
      expect(byValueManager.getValidTransitions(Draft)).toEqual([Shipped]);
      expect(byValueManager.hasTransitionsDefined(Draft)).toBe(true);
    });

    it('debe usar el mismo orden al detectar huérfanos', () => {
      const byValueManager = new StateTransitionManager<Status>(wildcardAware);
      byValueManager.defineTransitions(
        new Map<Status, Status[]>([[Wildcard, [Shipped]]]),
      );

      // SHIPPED es destino y el origen declarado '*' lo acepta como salida:
      // bajo el orden (declarado, consultado) no es huérfano.
      expect(byValueManager.validateTransitionGraph().orphanedStates).toEqual(
        [],
      );
    });
  });

  describe('getValidTransitions', () => {
    beforeEach(() => {
      manager.defineTransitions(orderFlow());
    });

    it('debe lanzar ArgumentNullException si el estado es null', () => {
      expect(() => manager.getValidTransitions(null as any)).toThrow(
        'state cannot be null or undefined',
      );
    });

    it('debe lanzar ArgumentNullException si el estado es undefined', () => {
      expect(() => manager.getValidTransitions(undefined as any)).toThrow(
        ArgumentNullException,
      );
    });

    it('debe devolver los destinos en el orden declarado', () => {
      expect(manager.getValidTransitions(Draft)).toEqual([Pending, Cancelled]);
    });

    it('debe devolver un array vacío para un estado sin entrada, sin lanzar', () => {
      // Contraste deliberado con canTransitionTo, que sí lanza en este caso.
      expect(manager.getValidTransitions(Shipped)).toEqual([]);
    });

    it('debe devolver una copia defensiva', () => {
      const targets = manager.getValidTransitions(Draft) as Status[];
      targets.push(Shipped);
      targets.length = 0;

      expect(manager.getValidTransitions(Draft)).toEqual([Pending, Cancelled]);
      expect(manager.canTransitionTo(Draft, Shipped)).toBe(false);
    });

    it('debe devolver un array nuevo en cada llamada', () => {
      expect(manager.getValidTransitions(Draft)).not.toBe(
        manager.getValidTransitions(Draft),
      );
    });

    it('debe resolver el estado con el comparador personalizado', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);
      byValueManager.defineTransitions(orderFlow());

      expect(
        byValueManager.getValidTransitions(new Status('CONFIRMED')),
      ).toEqual([Shipped]);
    });
  });

  describe('hasTransitions', () => {
    it('debe devolver false en un manager recién creado', () => {
      expect(manager.hasTransitions()).toBe(false);
    });

    it('debe devolver true tras definir transiciones', () => {
      manager.defineTransitions(orderFlow());

      expect(manager.hasTransitions()).toBe(true);
    });

    it('debe devolver false tras clear()', () => {
      manager.defineTransitions(orderFlow());
      manager.clear();

      expect(manager.hasTransitions()).toBe(false);
    });
  });

  describe('hasTransitionsDefined', () => {
    beforeEach(() => {
      manager.defineTransitions(orderFlow());
    });

    it('debe lanzar ArgumentNullException si el estado es null', () => {
      expect(() => manager.hasTransitionsDefined(null as any)).toThrow(
        'state cannot be null or undefined',
      );
    });

    it('debe devolver true para un estado origen', () => {
      expect(manager.hasTransitionsDefined(Draft)).toBe(true);
      expect(manager.hasTransitionsDefined(Confirmed)).toBe(true);
    });

    it('debe devolver false para un estado que sólo aparece como destino', () => {
      // Distinguir origen de destino es justo lo que permite preguntar
      // "¿es terminal?" sin capturar NoTransitionsDefinedException.
      expect(manager.hasTransitionsDefined(Shipped)).toBe(false);
      expect(manager.hasTransitionsDefined(Cancelled)).toBe(false);
    });

    it('debe devolver false para un estado ajeno al grafo', () => {
      expect(manager.hasTransitionsDefined(new Status('ARCHIVED'))).toBe(false);
    });

    it('debe resolver el estado con el comparador personalizado', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);
      byValueManager.defineTransitions(orderFlow());

      expect(byValueManager.hasTransitionsDefined(new Status('DRAFT'))).toBe(
        true,
      );
      expect(byValueManager.hasTransitionsDefined(new Status('SHIPPED'))).toBe(
        false,
      );
    });
  });

  describe('getAllStates', () => {
    it('debe devolver un array vacío sin transiciones definidas', () => {
      expect(manager.getAllStates()).toEqual([]);
    });

    it('debe devolver sólo los estados origen, en orden de inserción', () => {
      manager.defineTransitions(orderFlow());

      // Shipped y Cancelled son destinos: no deben aparecer aquí.
      expect(manager.getAllStates()).toEqual([Draft, Pending, Confirmed]);
    });

    it('debe reflejar el clear()', () => {
      manager.defineTransitions(orderFlow());
      manager.clear();

      expect(manager.getAllStates()).toEqual([]);
    });
  });

  describe('getTransitionGraph', () => {
    it('debe devolver un objeto vacío sin transiciones definidas', () => {
      expect(manager.getTransitionGraph()).toEqual({});
    });

    it('debe proyectar el grafo usando los nombres de estado', () => {
      manager.defineTransitions(orderFlow());

      expect(manager.getTransitionGraph()).toEqual({
        DRAFT: ['PENDING', 'CANCELLED'],
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['SHIPPED'],
      });
    });

    it('debe construir un objeto nuevo en cada llamada', () => {
      manager.defineTransitions(orderFlow());

      const graph = manager.getTransitionGraph();
      graph.DRAFT.push('HACKED');
      delete graph.PENDING;

      expect(manager.getTransitionGraph()).toEqual({
        DRAFT: ['PENDING', 'CANCELLED'],
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['SHIPPED'],
      });
    });
  });

  describe('validateTransitionGraph', () => {
    it('debe reportar un grafo vacío como válido y sin avisos', () => {
      const result = manager.validateTransitionGraph();

      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual([]);
      expect(result.orphanedStates).toEqual([]);
    });

    it('debe marcar como huérfanos los destinos sin transiciones de salida', () => {
      manager.defineTransitions(orderFlow());

      const result = manager.validateTransitionGraph();

      expect(result.orphanedStates).toEqual(
        expect.arrayContaining([Cancelled, Shipped]),
      );
      expect(result.orphanedStates).toHaveLength(2);
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings.join('\n')).toContain("State 'SHIPPED'");
      expect(result.warnings.join('\n')).toContain("State 'CANCELLED'");
    });

    it('no debe marcar huérfanos en un grafo totalmente cíclico', () => {
      manager.defineTransitions(
        new Map<Status, Status[]>([
          [Draft, [Pending]],
          [Pending, [Confirmed]],
          [Confirmed, [Draft]],
        ]),
      );

      const result = manager.validateTransitionGraph();

      expect(result.orphanedStates).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('debe seguir reportando isValid=true aunque haya avisos', () => {
      manager.defineTransitions(orderFlow());

      const result = manager.validateTransitionGraph();

      // Sorprendente pero deliberado: isValid está fijo en true porque los
      // estados terminales son legítimos. isValid NO es un resumen de warnings;
      // quien quiera fallar ante avisos debe mirar warnings.length.
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.isValid).toBe(true);
    });

    it('debe reportar un estado terminal UNA vez aunque llegue por varias instancias', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);
      byValueManager.defineTransitions(
        new Map<Status, Status[]>([
          [Draft, [new Status('SHIPPED')]],
          [Pending, [new Status('SHIPPED')]],
          [Confirmed, [new Status('SHIPPED')]],
        ]),
      );

      const result = byValueManager.validateTransitionGraph();

      // Un Set indexa por identidad: tres instancias de SHIPPED producían tres
      // huérfanos y tres avisos para un único estado lógico. El informe se
      // deduplica con el comparador, no con la identidad.
      expect(result.orphanedStates).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain("State 'SHIPPED'");
    });

    it('debe conservar el orden de aparición al deduplicar destinos', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);
      byValueManager.defineTransitions(
        new Map<Status, Status[]>([
          [Draft, [new Status('CANCELLED'), new Status('PENDING')]],
          [Pending, [new Status('SHIPPED'), new Status('CANCELLED')]],
        ]),
      );

      const result = byValueManager.validateTransitionGraph();

      expect(result.orphanedStates.map((s) => s.name)).toEqual([
        'CANCELLED',
        'SHIPPED',
      ]);
    });

    it('debe resolver la pertenencia con el comparador personalizado', () => {
      const byValueManager = new StateTransitionManager<Status>(byName);
      // El destino es un clon del origen Pending: con igualdad por valor
      // NO es huérfano, con igualdad por referencia sí lo sería.
      byValueManager.defineTransitions(
        new Map<Status, Status[]>([
          [new Status('DRAFT'), [new Status('PENDING')]],
          [new Status('PENDING'), [new Status('DRAFT')]],
        ]),
      );

      expect(byValueManager.validateTransitionGraph().orphanedStates).toEqual(
        [],
      );
    });
  });

  describe('clear', () => {
    it('debe eliminar todas las transiciones', () => {
      manager.defineTransitions(orderFlow());

      manager.clear();

      expect(manager.hasTransitions()).toBe(false);
      expect(manager.getAllStates()).toEqual([]);
      expect(manager.getTransitionGraph()).toEqual({});
    });

    it('debe ser seguro sobre un manager vacío', () => {
      expect(() => manager.clear()).not.toThrow();
      expect(manager.hasTransitions()).toBe(false);
    });

    it('debe permitir redefinir transiciones después', () => {
      manager.defineTransitions(orderFlow());
      manager.clear();
      manager.defineTransitions(
        new Map<Status, Status[]>([[Shipped, [Draft]]]),
      );

      expect(manager.canTransitionTo(Shipped, Draft)).toBe(true);
    });
  });

  describe('validateTransition', () => {
    beforeEach(() => {
      manager.defineTransitions(orderFlow());
    });

    it('debe lanzar ArgumentNullException si currentState es null', () => {
      expect(() => manager.validateTransition(null as any, Pending)).toThrow(
        'currentState cannot be null or undefined',
      );
    });

    it('debe lanzar ArgumentNullException si newState es null', () => {
      expect(() => manager.validateTransition(Draft, null as any)).toThrow(
        'newState cannot be null or undefined',
      );
    });

    it('debe validar currentState antes que newState', () => {
      expect(() =>
        manager.validateTransition(null as any, null as any),
      ).toThrow('currentState cannot be null or undefined');
    });

    it('no debe lanzar para una transición válida', () => {
      expect(() => manager.validateTransition(Draft, Pending)).not.toThrow();
      expect(manager.validateTransition(Draft, Pending)).toBeUndefined();
    });

    it('debe lanzar InvalidStateTransitionException nombrando ambos estados', () => {
      // El mensaje es la única pista que llega al log en producción; si los
      // nombres se pierden el error deja de ser accionable.
      expect(() => manager.validateTransition(Draft, Shipped)).toThrow(
        InvalidStateTransitionException,
      );
      expect(() => manager.validateTransition(Draft, Shipped)).toThrow(
        "Invalid state transition from 'DRAFT' to 'SHIPPED'",
      );
    });

    it('debe propagar NoTransitionsDefinedException para un estado terminal', () => {
      // No se convierte en InvalidStateTransitionException: el llamador puede
      // distinguir "transición prohibida" de "estado sin reglas".
      expect(() => manager.validateTransition(Shipped, Draft)).toThrow(
        NoTransitionsDefinedException,
      );
    });

    it('debe ser coherente con canTransitionTo', () => {
      const pairs: Array<[Status, Status]> = [
        [Draft, Pending],
        [Draft, Confirmed],
        [Pending, Cancelled],
        [Confirmed, Shipped],
        [Confirmed, Draft],
      ];

      for (const [from, to] of pairs) {
        const allowed = manager.canTransitionTo(from, to);
        if (allowed) {
          expect(() => manager.validateTransition(from, to)).not.toThrow();
        } else {
          expect(() => manager.validateTransition(from, to)).toThrow(
            InvalidStateTransitionException,
          );
        }
      }
    });
  });

  describe('resolución del nombre de estado', () => {
    // getStateName es privado, pero define todos los mensajes de error y las
    // claves de getTransitionGraph, así que se ejercita por la API pública.

    it('debe preferir un toString() personalizado', () => {
      class Printable {
        constructor(private readonly label: string) {}
        toString(): string {
          return this.label;
        }
      }
      const anyManager = new StateTransitionManager<object>();
      anyManager.defineTransitions(
        new Map<object, object[]>([[new Printable('A'), [new Printable('B')]]]),
      );

      expect(anyManager.getTransitionGraph()).toEqual({ A: ['B'] });
    });

    it('debe usar la propiedad name cuando no hay toString() propio', () => {
      const anyManager = new StateTransitionManager<object>();
      anyManager.defineTransitions(
        new Map<object, object[]>([
          [{ name: 'FROM_NAME' }, [{ name: 'TO_NAME' }]],
        ]),
      );

      expect(anyManager.getTransitionGraph()).toEqual({
        FROM_NAME: ['TO_NAME'],
      });
    });

    it('debe usar la propiedad value cuando name no es un string', () => {
      // Caso real: value objects que exponen `value` y heredan un `name` numérico
      // o inexistente. El orden de la cadena de fallback importa.
      const anyManager = new StateTransitionManager<object>();
      anyManager.defineTransitions(
        new Map<object, object[]>([
          [{ name: 1, value: 'FROM_VALUE' }, [{ value: 42 }]],
        ]),
      );

      expect(anyManager.getTransitionGraph()).toEqual({
        FROM_VALUE: ['42'],
      });
    });

    it('debe caer al nombre del constructor para objetos sin name ni value', () => {
      class Terminal {}
      const anyManager = new StateTransitionManager<object>();
      anyManager.defineTransitions(
        new Map<object, object[]>([[{}, [new Terminal()]]]),
      );

      expect(anyManager.getTransitionGraph()).toEqual({
        Object: ['Terminal'],
      });
    });

    it("debe devolver 'Unknown State' para un objeto sin prototipo", () => {
      // Object.create(null) no tiene toString ni constructor: es el único camino
      // hasta la última rama del fallback y no debe reventar al leerlos.
      const noProto = Object.create(null);
      const anyManager = new StateTransitionManager<object>();
      anyManager.defineTransitions(
        new Map<object, object[]>([[noProto, [Object.create(null)]]]),
      );

      expect(anyManager.getTransitionGraph()).toEqual({
        'Unknown State': ['Unknown State'],
      });
    });
  });

  describe('ejemplo principal del JSDoc', () => {
    // El ejemplo de la clase usaba `enum OrderStatus { Draft = 'DRAFT' }` como
    // TState. No compilaba: TState extends object rechaza los miembros de un
    // enum (strings o números). Aquí queda transcrito para que ts-jest lo
    // compile de verdad en cada ejecución.

    class OrderStatus {
      static readonly Draft = new OrderStatus('DRAFT');
      static readonly Pending = new OrderStatus('PENDING');
      static readonly Confirmed = new OrderStatus('CONFIRMED');
      static readonly Shipped = new OrderStatus('SHIPPED');

      private constructor(public readonly name: string) {}
    }

    it('debe compilar y funcionar tal cual está escrito', () => {
      const docManager = new StateTransitionManager<OrderStatus>();
      docManager.defineTransitions(
        new Map<OrderStatus, OrderStatus[]>([
          [OrderStatus.Draft, [OrderStatus.Pending]],
          [OrderStatus.Pending, [OrderStatus.Confirmed]],
          [OrderStatus.Confirmed, [OrderStatus.Shipped]],
        ]),
      );

      expect(
        docManager.canTransitionTo(OrderStatus.Draft, OrderStatus.Pending),
      ).toBe(true);
      expect(docManager.getTransitionGraph()).toEqual({
        DRAFT: ['PENDING'],
        PENDING: ['CONFIRMED'],
        CONFIRMED: ['SHIPPED'],
      });
    });

    it('no debe reintroducir un enum como TState en la documentación', () => {
      // La transcripción de arriba no protege el comentario: si alguien
      // devuelve el ejemplo a un enum, sólo esto lo detecta.
      const source = readFileSync(
        join(__dirname, 'state-transition.manager.ts'),
        'utf8',
      );
      const classDoc = source.slice(0, source.indexOf('export class'));

      expect(classDoc).not.toMatch(/\benum\s+\w+\s*\{/);
    });
  });

  describe('escenario completo de ciclo de vida de un pedido', () => {
    it('debe recorrer el flujo feliz y bloquear los atajos', () => {
      const flow = new StateTransitionManager<Status>(byName);
      flow.defineTransitions(orderFlow());

      let current = new Status('DRAFT');

      expect(flow.canTransitionTo(current, new Status('SHIPPED'))).toBe(false);

      flow.validateTransition(current, new Status('PENDING'));
      current = new Status('PENDING');

      flow.validateTransition(current, new Status('CONFIRMED'));
      current = new Status('CONFIRMED');

      flow.validateTransition(current, new Status('SHIPPED'));
      current = new Status('SHIPPED');

      // SHIPPED es terminal: no hay salidas y el manager lo señala lanzando.
      expect(flow.getValidTransitions(current)).toEqual([]);
      expect(flow.hasTransitionsDefined(current)).toBe(false);
      expect(() =>
        flow.canTransitionTo(current, new Status('CANCELLED')),
      ).toThrow(NoTransitionsDefinedException);
    });
  });
});
