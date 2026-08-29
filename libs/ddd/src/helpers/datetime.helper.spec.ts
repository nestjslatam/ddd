import { DateTimeHelper } from './datetime.helper';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

describe('DateTimeHelper', () => {
  afterEach(() => {
    // Cada test que congela el reloj debe devolverlo a tiempo real; de lo
    // contrario el reloj falso se filtra a los tests siguientes del archivo.
    jest.useRealTimers();
  });

  describe('getUtcDate', () => {
    it('debe retornar una Date válida truncada a medianoche UTC', () => {
      const result = DateTimeHelper.getUtcDate();

      expect(result).toBeInstanceOf(Date);
      expect(Number.isNaN(result.getTime())).toBe(false);
      // El invariante que importa: el timestamp cae exactamente en un múltiplo
      // de 24h desde epoch. Si alguien "simplifica" a new Date(y, m, d)
      // (constructor local) esto se rompe en cualquier zona distinta de UTC.
      expect(result.getTime() % MS_PER_DAY).toBe(0);
      expect(result.toISOString()).toMatch(/T00:00:00\.000Z$/);
    });

    it('debe descartar hora, minutos, segundos y milisegundos del instante actual', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-05-15T23:59:59.999Z'));

      const result = DateTimeHelper.getUtcDate();

      expect(result.getTime()).toBe(Date.UTC(2024, 4, 15));
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
    });

    it('debe conservar el mes base 0 sin desplazarlo', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-09T12:00:00.000Z'));

      const result = DateTimeHelper.getUtcDate();

      // getUTCMonth() es base 0 y Date.UTC también: mezclarlos con una API
      // base 1 produce el clásico off-by-one de mes, invisible salvo que se
      // afirme el mes concreto.
      expect(result.getUTCMonth()).toBe(0);
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCDate()).toBe(9);
      expect(result.toISOString()).toBe('2024-01-09T00:00:00.000Z');
    });

    it('debe seguir la fecha UTC aunque la fecha local del proceso sea otra', () => {
      // 23:00Z del 31/12: en cualquier zona con offset >= +01:00 el calendario
      // local ya está en 2024, pero el helper debe seguir reportando 2023-12-31.
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-12-31T23:00:00.000Z'));

      const result = DateTimeHelper.getUtcDate();

      expect(result.toISOString()).toBe('2023-12-31T00:00:00.000Z');
    });

    it('debe manejar el primer instante del año', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const result = DateTimeHelper.getUtcDate();

      // En el primer milisegundo del día el truncado es la identidad: el
      // resultado debe ser el mismo instante, no el día anterior.
      expect(result.getTime()).toBe(Date.parse('2024-01-01T00:00:00.000Z'));
    });

    it('debe preservar el 29 de febrero en año bisiesto', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-02-29T08:30:00.000Z'));

      const result = DateTimeHelper.getUtcDate();

      // Date.UTC normaliza días fuera de rango (Date.UTC(2023, 1, 29) sería
      // el 1 de marzo), así que el bisiesto es el caso donde un cambio en el
      // cálculo del día se manifiesta como un salto de fecha.
      expect(result.toISOString()).toBe('2024-02-29T00:00:00.000Z');
    });

    it('debe manejar el último día del año', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2022-12-31T17:45:12.345Z'));

      const result = DateTimeHelper.getUtcDate();

      expect(result.toISOString()).toBe('2022-12-31T00:00:00.000Z');
    });

    it('debe coincidir con la fecha UTC calculada de forma independiente', () => {
      const now = new Date();

      const result = DateTimeHelper.getUtcDate();

      // Cálculo de referencia sin congelar el reloj: sólo puede diferir si la
      // ejecución cruza la medianoche UTC entre ambas líneas, y en ese caso el
      // helper devolvería el día siguiente (nunca uno anterior).
      const expected = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
      );
      expect(result.getTime() - expected).toBeGreaterThanOrEqual(0);
      expect(result.getTime() - expected).toBeLessThanOrEqual(MS_PER_DAY);
    });

    it('debe retornar una instancia nueva en cada llamada', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-07-04T10:00:00.000Z'));

      const first = DateTimeHelper.getUtcDate();
      const second = DateTimeHelper.getUtcDate();

      expect(first).not.toBe(second);
      expect(first.getTime()).toBe(second.getTime());
    });

    it('no debe verse afectado por mutaciones de una Date devuelta antes', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-07-04T10:00:00.000Z'));

      const first = DateTimeHelper.getUtcDate();
      first.setUTCFullYear(1970);

      // Date es mutable: si el helper cacheara la instancia, el llamador
      // anterior podría corromper la fecha de todos los demás.
      expect(DateTimeHelper.getUtcDate().toISOString()).toBe(
        '2024-07-04T00:00:00.000Z',
      );
    });

    it('debe funcionar desreferenciado del contexto de la clase', () => {
      const { getUtcDate } = DateTimeHelper;

      // El helper se usa como función estática pura; si pasara a depender de
      // `this` (método de instancia o campo de clase), esto lanzaría.
      expect(() => getUtcDate()).not.toThrow();
      expect(getUtcDate()).toBeInstanceOf(Date);
    });
  });

  describe('getTimeStamp', () => {
    it('debe retornar el epoch actual en milisegundos', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-05-15T23:59:59.999Z'));

      expect(DateTimeHelper.getTimeStamp()).toBe(
        Date.parse('2024-05-15T23:59:59.999Z'),
      );
    });

    it('debe retornar un número primitivo entero, no una Date', () => {
      const result = DateTimeHelper.getTimeStamp();

      expect(typeof result).toBe('number');
      expect(Number.isInteger(result)).toBe(true);
      expect(result).not.toBeInstanceOf(Date);
    });

    it('debe estar en milisegundos y no en segundos', () => {
      const result = DateTimeHelper.getTimeStamp();

      // Un cambio a Math.floor(Date.now() / 1000) seguiría devolviendo un
      // número creciente y pasaría cualquier test laxo; la magnitud es lo que
      // distingue milisegundos de segundos.
      expect(result).toBeGreaterThan(1_000_000_000_000);
      expect(Math.abs(result - new Date().getTime())).toBeLessThan(1000);
    });

    it('debe avanzar cuando avanza el reloj del sistema', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-05-15T00:00:00.000Z'));
      const before = DateTimeHelper.getTimeStamp();

      jest.advanceTimersByTime(5000);

      expect(DateTimeHelper.getTimeStamp()).toBe(before + 5000);
    });

    it('no debe decrecer entre llamadas sucesivas', () => {
      const first = DateTimeHelper.getTimeStamp();
      const second = DateTimeHelper.getTimeStamp();

      // Es la garantía de la que dependen los timestamps de auditoría y el
      // ordenamiento de eventos de dominio.
      expect(second).toBeGreaterThanOrEqual(first);
    });

    it('debe funcionar desreferenciado del contexto de la clase', () => {
      const { getTimeStamp } = DateTimeHelper;

      expect(() => getTimeStamp()).not.toThrow();
      expect(typeof getTimeStamp()).toBe('number');
    });
  });

  describe('relación entre getUtcDate y getTimeStamp', () => {
    it('el timestamp debe caer dentro del día UTC que reporta getUtcDate', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-09-21T13:37:00.500Z'));

      const day = DateTimeHelper.getUtcDate().getTime();
      const stamp = DateTimeHelper.getTimeStamp();

      // Ambos leen el mismo reloj: el timestamp nunca puede quedar antes de la
      // medianoche del día que devuelve getUtcDate ni 24h después.
      expect(stamp - day).toBeGreaterThanOrEqual(0);
      expect(stamp - day).toBeLessThan(MS_PER_DAY);
    });
  });
});
