<div align="center">

# `@nestjslatam/ddd-lib`

**Bloques de construcción de Domain-Driven Design para NestJS.**
Agregados que recolectan sus propias reglas rotas, value objects que se validan solos y seguimiento de estado — sobre `@nestjs/cqrs`.

[![npm](https://img.shields.io/npm/v/%40nestjslatam%2Fddd-lib?color=1e73be&label=ddd-lib)](https://www.npmjs.com/package/@nestjslatam/ddd-lib)
[![CI](https://github.com/nestjslatam/ddd/actions/workflows/ci.yml/badge.svg)](https://github.com/nestjslatam/ddd/actions/workflows/ci.yml)
[![tests](https://img.shields.io/badge/tests-1111%20pasando-00d084)](#ejecutar-las-pruebas)
[![coverage](https://img.shields.io/badge/cobertura-85%25%20combinada-00d084)](#ejecutar-las-pruebas)
[![node](https://img.shields.io/badge/node-%3E%3D20.11-575760)](#requisitos)
[![license](https://img.shields.io/badge/licencia-MIT-575760)](LICENSE)

[Inicio rápido](#inicio-rápido) · [Preguntas frecuentes](#preguntas-frecuentes) · [Los cuatro paquetes](#los-cuatro-paquetes) · [Colaborar](#colaborar) · [El CLI](#el-cli)

**[📖 Documentación completa en docs.nestjslatam.dev](https://docs.nestjslatam.dev)**

</div>

---

```bash
npm install @nestjslatam/ddd-lib @nestjs/cqrs
```

`@nestjs/cqrs` no es opcional — `DddAggregateRoot` extiende su `AggregateRoot`. La lista completa de dependencias par está en [Requisitos](#requisitos).

## Inicio rápido

```ts
import {
  DddAggregateRoot,
  NumberValueObject,
  AbstractRuleValidator,
  IdValueObject,
} from '@nestjslatam/ddd-lib';

// Cada regla vive en su propia clase, así se puede probar por separado.
class PriceRule extends AbstractRuleValidator<Price> {
  addRules(): void {
    if (this.subject.getValue() <= 0) {
      this.addBrokenRule('value', 'El precio debe ser mayor que cero');
    }
  }
}

export class Price extends NumberValueObject {
  static create(value: number): Price {
    const price = new Price(value);
    if (!price.isValid) {
      throw new Error(price.brokenRules.getBrokenRules()[0].message);
    }
    return price;
  }

  override addValidators(): void {
    super.addValidators(); // la base registra reglas reales aquí — encadena siempre
    this.validatorRules.add(new PriceRule(this));
  }
}

// El agregado carga las invariantes que abarcan más de un value object.
export class Product extends DddAggregateRoot<Product, IProductProps> {
  private constructor(props: IProductProps, id?: IdValueObject) {
    super(props, { id });
    this.trackingState.markAsNew();
  }

  static create(name: Name, price: Price): Product {
    const product = new Product({ name, price });
    if (!product.isValid) {
      // La validación RECOLECTA reglas, nunca lanza. Si te saltas esta
      // comprobación, create() devuelve tan tranquilo un objeto que incumple
      // sus propias invariantes.
      throw new Error(
        product.brokenRules
          .getBrokenRules()
          .map((r) => r.message)
          .join(', '),
      );
    }
    return product;
  }

  protected override addValidators(): void {
    this.validators.add(new ProductRule(this));
  }
}
```

Lo que eso te da, y dónde se detecta cada fallo:

| Entrada               | Resultado                                             | Lo detecta                                  |
| --------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `Price.create(49.99)` | válido                                                | —                                           |
| `Price.create(0)`     | `value must be a positive number (greater than zero)` | el validador **base** de `NumberValueObject` |
| precio `2_000_000`    | `Price must be less than 1000000`                     | el **agregado**, `ProductRule`              |

Fíjate en la segunda fila: `El precio debe ser mayor que cero` **nunca se disparó**. `super.addValidators()` ya había registrado la regla de número positivo de la base, que atrapó el `0` primero. Quita ese `super` y **ambas** reglas desaparecen en silencio — sin error, con el valor inválido aceptado.

Esto no está copiado de memoria. El código de arriba vive en [`libs/ddd/src/readme-example.spec.ts`](libs/ddd/src/readme-example.spec.ts), que comprueba las tres filas más la forma del getter, y **CI lo ejecuta en cada push**. Los ejemplos a los que sustituyó tenían siete errores de tipos y nunca habían compilado contra ninguna versión publicada — porque nadie los ejecutaba.

> [!IMPORTANT]
> **Dónde está esta librería, en números.** La `4.0.0` es la primera versión con una batería de pruebas que cubre las clases que realmente extiendes. Antes, once de los doce ficheros del núcleo — incluidos `DddAggregateRoot` y `DddValueObject` — **no tenían ni un test**, y escribir esas pruebas destapó **34 defectos**, ocho graves: un agregado que fallaba la validación no podía volver a ser válido nunca, `clone()` devolvía un alias en lugar de una copia, y todas las opciones de `StringValueObject` se ignoraban en silencio.
>
> La cobertura pasó del 58,4 % al **98,6 %**, y las pruebas de 308 a **1017**. Así que la afirmación honesta no es «no lo uses» ni «es estable», sino ésta:
>
> |                                               |                                                                                                                                     |
> | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
> | **Probado**                                   | Las bases de agregado y value object, la validación, las reglas rotas, el seguimiento de estado y la identidad. Cubiertas y fijadas por pruebas de regresión. |
> | **Recién cubierto, menos rodado en producción** | Transiciones de estado, eventos de dominio y enums — sin pruebas hasta la `4.0.0`, así que los tests son nuevos aunque el código no lo sea. |
> | **El riesgo real**                            | **Cambios de API, no de corrección.** La `4.0.0` cambió el comportamiento observable en ocho sitios y el compilador no detecta ninguno. |
>
> **Clava una versión exacta.** La API se estabiliza a partir de la `4.0.0`: ningún cambio incompatible se publicará sin un ciclo de obsolescencia donde sea técnicamente posible. Esa promesa se gana a lo largo de un ciclo de versiones, no anunciándola — júzgala en la `4.1.0`.
>
> **No instales la `2.0.0` ni la `2.1.0`.** Ambas están marcadas como obsoletas en npm por reventar al importarlas, y un rango `^2.0.0` todavía resuelve a ellas.

### Migrar

**A la `3.0.0`** — un solo cambio, y el compilador encuentra todos los sitios:

```diff
- if (!aggregate.isValid()) {
+ if (!aggregate.isValid) {
```

`isValid` era un **método** en los agregados y un **getter** en los value objects — el mismo nombre con dos formas, que es exactamente cómo un guard como `if (!aggregate.isValid)` podía leerse como una `Function` siempre verdadera y no dispararse jamás. Ahora los dos son getters. TypeScript avisa con `TS6234`; para quien consuma desde JavaScript, `npx ddd validate` señala cada llamada leyendo cómo lo declara **tu versión instalada**.

**A la `4.0.0`** — no hay nada que buscar, porque el compilador no detecta nada de esto. Cambiaron ocho comportamientos, en el orden en que probablemente te afecten:

1. **Quita cualquier apaño con `brokenRules.clear()`** antes de `validate()`. Ahora se limpia solo.
2. **Revisa todo lo que lea `clone()` / `getCopy()`.** Devuelven una copia de verdad; si dependías de que la copia compartiera estado, eso era el bug. Vuelve a suscribir en la copia los manejadores de cambio de propiedad.
3. **Pasa a minúsculas los UUID que tengas guardados**, o espéralos en minúsculas al leer. `IdValueObject` los canonicaliza, así que el mismo UUID en dos capitalizaciones es por fin una sola identidad.
4. **Vuelve a comprobar las subclases de `StringValueObject` que pasen opciones.** `allowEmpty`, `trimWhitespace`, `minLength` y `maxLength` se ignoraban y ahora se aplican, así que valores que antes pasaban pueden fallar.
5. **`IdValueObject.setValue()` lanza** ante cualquier cosa que no sea un UUID, en vez de aceptarlo en silencio.
6. **`DddEnum.getAll()` devuelve un array nuevo** en cada llamada; `getAll() === getAll()` ya no es cierto.
7. **Un comparador de estado personalizado recibe `(definedState, queryState)`** en todas las llamadas.
8. **La detección de cambios anidados ahora se dispara** para los objetos propios de esta librería, así que los repositorios pueden ver escrituras que antes se saltaban.

El [registro de cambios](CHANGELOG.md) explica el razonamiento de cada uno.

## Qué obtienes

`DddAggregateRoot` extiende el `AggregateRoot` de `@nestjs/cqrs` y trae cableados cuatro colaboradores que si no tendrías que escribir a mano: `BrokenRulesManager` (recolección de errores), `ValidatorRuleManager` (registro de reglas), `TrackingStateManager` (nuevo / sucio / limpio) y `StateTransitionManager` (una máquina de estados). Más la identidad de `IdValueObject`, un `equals` consciente del prototipo y `toPlainObject`.

`npx ddd list` imprime el inventario completo leyendo las declaraciones de la versión que tengas instalada, así que no puede quedarse obsoleto como sí le pasaría a una tabla escrita aquí.

## Los cuatro paquetes

| Paquete                                                               | Instálalo cuando                                                                | Versión |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------- |
| **[`ddd-lib`](https://www.npmjs.com/package/@nestjslatam/ddd-lib)**   | Siempre. Ésta es la librería. Se construye desde `libs/ddd` en este repositorio. | `4.0.0` |
| [`ddd-cli`](https://github.com/nestjslatam/ddd-cli)                   | Como dependencia **de desarrollo**, para andamiar y auditar. No es de ejecución. | `0.4.0` |
| [`ddd-valueobjects`](https://github.com/nestjslatam/ddd-valueobjects) | Quieres tipos ya hechos de email, teléfono, dinero o documentos de identidad.    | `1.3.0` |
| [`ddd-es-lib`](https://github.com/nestjslatam/ddd-event-sourcing)     | Vas a hacer event sourcing sobre MongoDB. Exige `mongoose`.                      | `1.5.1` |

## El CLI

[`@nestjslatam/ddd-cli`](https://github.com/nestjslatam/ddd-cli) lee los ficheros `.d.ts` del `ddd-lib` **instalado en tu proyecto** usando la API del compilador de TypeScript — así que describe tu versión, y no aquella contra la que se construyó.

```bash
npx ddd list                  # cada estereotipo, agrupado por cómo se usa
npx ddd new value-object Sku  # andamiaje; no escribe nada hasta que confirmas
npx ddd validate              # audita contra el idioma de la librería
```

`validate` aplica cuatro reglas, cada una un error que esta librería hace fácil y silencioso:

| Regla                                 | El error que atrapa                                                                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-subclass-state-in-add-validators` | El constructor base llama a `addValidators()` **antes** de que se ejecute el cuerpo del tuyo. Leer un campo que asignas ahí lanza en cada construcción — exactamente como `NumberValueObject` se publicó roto durante dos versiones. |
| `super-add-validators`                | Un override que no encadena tira los validadores reales de la base, y los valores inválidos pasan sin error.                                                                                                               |
| `factory-checks-validity`             | Un `create()` que se salta la comprobación de `isValid` devuelve objetos que incumplen sus propias invariantes.                                                                                                            |
| `handler-commits-events`              | Sólo `mergeObjectContext(...).commit()` despacha los eventos de dominio. Sin eso el comando triunfa y todos los manejadores se saltan en silencio.                                                                         |

También corre como **servidor MCP**, así que Claude Code, Codex o Cursor lo manejan con su propio modelo y **sin clave de API**:

```bash
claude mcp add ddd -- npx -y @nestjslatam/ddd-cli mcp
```

## La aplicación de ejemplo

`src/` es un ejemplo de Pedidos y Productos que consume la librería. No se publica.

```bash
npm install
npm run start:dev     # :3000, Swagger en /api
```

Un recorrido completo, cubierto por [`test/app.e2e-spec.ts`](test/app.e2e-spec.ts):

```bash
POST  /products                      201   { "id": "..." }
POST  /orders                        201   un DRAFT vacío
POST  /orders/:id/items              200
PATCH /orders/:id/items/:productId   200
POST  /orders/:id/confirm            200
```

Dos clases de error, dos respuestas — y la distinción es el motivo de todo esto:

| Petición                 | Respuesta                        | Lo detecta                                       |
| ------------------------ | -------------------------------- | ------------------------------------------------ |
| `price: "cuarenta"`      | **400** nombrando el campo       | `ValidationPipe`, antes de que el dominio lo vea |
| `price: 0`               | **422** con las reglas rotas     | `PriceRangeValidator`, dentro del agregado       |
| `{ ..., isAdmin: true }` | **201**, la clave extra se quita | `whitelist: true`                                |

```json
// POST /products  { "price": 0 }  ->  422
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Price is invalid",
  "brokenRules": [
    {
      "property": "value",
      "message": "Price must be greater than zero",
      "severity": "Error"
    }
  ]
}
```

Un **tipo** equivocado es estructura y nunca llega al dominio. Un **valor** equivocado es significado, y sólo el agregado puede juzgarlo. `DomainExceptionFilter` mapea todo el vocabulario del dominio:

| Excepción                         | Estado | Se llega desde                                          |
| --------------------------------- | ------ | ------------------------------------------------------- |
| `BrokenRulesException`            | `422`  | `quantity: 0`, `price: 0` — rechazados por una invariante |
| `ArgumentNullException`           | `400`  | un valor obligatorio ausente o en blanco                |
| `InvalidFormatException`          | `400`  | un id que no es UUID, un estado fuera del enum          |
| `InvalidStateTransitionException` | `409`  | `DRAFT → SHIPPED`                                       |
| `InvalidOperationException`       | `409`  | confirmar un pedido sin artículos                       |
| `NotFoundException` de Nest       | `404`  | un artículo que el pedido no contiene                   |

Todo lo que **no** sea una excepción de dominio se deja deliberadamente como `500`. Dos `throw` en `money.vo.ts` siguen así a propósito, con un comentario que lo explica: ningún endpoint puede pedir una división por cero, así que llegar a una significa un bug en este código, y disfrazar un fallo de error del cliente lo esconde.

Los repositorios son en memoria por diseño: el ejemplo trata sobre el dominio, no sobre una base de datos. Implementa el contrato del repositorio contra tu propio almacén.

## Preguntas frecuentes

<details>
<summary><b>Cuatro paquetes, ¿cuál instalo realmente?</b></summary>

`@nestjslatam/ddd-lib`, y sólo ése, salvo que necesites específicamente alguno de los otros. `ddd-cli` es dependencia de desarrollo. Mira [la tabla de arriba](#los-cuatro-paquetes).
</details>

<details>
<summary><b>¿Funciona con mi versión de NestJS y de Node?</b></summary>

Declarado: NestJS 10 u 11, Node `>=20.11`. En la práctica **sólo se ejercita NestJS 11.2.3** — CI varía Node (18, 20, 22) y nunca varía NestJS, así que trata NestJS 10 como no probado, no como soportado.
</details>

<details>
<summary><b>¿Qué me da <code>DddAggregateRoot</code> frente a escribir mi propia clase base?</b></summary>

Los cuatro gestores que se listan en [Qué obtienes](#qué-obtienes), ya cableados a `@nestjs/cqrs`. Ten en cuenta que `StateTransitionManager` es la pieza menos rodada — el ejemplo de este repositorio no lo usa, se escribe su propio `canTransitionTo`.
</details>

<details>
<summary><b>¿Está listo para producción? ¿Qué versión clavo?</b></summary>

Sí para el modelo de dominio, con una versión exacta clavada — y eso es un cambio respecto a lo que decía este README antes de la `4.0.0`.

La `4.0.0` es la primera versión cuyas clases base tienen pruebas: 1017 de ellas, 98,6 % de líneas. Llegar ahí destapó 34 defectos, así que la advertencia anterior estaba ganada, no era relleno. Lo que queda no es riesgo de corrección sino **cambio de API** — la `4.0.0` movió comportamiento en ocho sitios que el compilador no ve. Clava exacto, lee la [migración](#migrar), y juzga la promesa de estabilidad en la `4.1.0` en lugar de creértela ahora.

No instales nunca la `2.0.0` ni la `2.1.0`: ambas están obsoletas en npm por reventar al importarlas.
</details>

<details>
<summary><b>¿Cuál es la trampa que me va a morder primero?</b></summary>

La validación **recolecta** reglas rotas y nunca lanza. Nada impide que un agregado inválido se escape salvo que tu fábrica compruebe `isValid` por su cuenta. La segunda: el constructor base llama a `addValidators()` antes de que corra el cuerpo del constructor de tu subclase, así que un validador que lea un campo que asignas ahí lanza en cada construcción.
</details>

<details>
<summary><b>Edité <code>libs/ddd</code> y la app en marcha no cambió. ¿Por qué?</b></summary>

Sólo las pruebas leen `libs/ddd/src` — el `moduleNameMapper` de Jest apunta ahí. `tsconfig.json` no tiene mapeo de rutas, así que `nest build` y `start:dev` resuelven el paquete desde `node_modules`. Ejecuta `npm run build:lib` e instala el tarball, o añade un mapeo de rutas, si quieres que la app ejercite tus cambios. **Esta separación puede esconder bugs**: pruebas en verde contra el fuente local mientras la app en marcha usa otra versión distinta.
</details>

<details>
<summary><b>¿Este repositorio es la librería o una app de ejemplo?</b></summary>

Las dos cosas, y la librería es lo importante. `libs/ddd/` es el paquete publicado; `src/` es el ejemplo que lo consume — Pedidos y Productos. Si encuentras algo que describa un módulo `Singers`, es anterior a la `4.0.0` y está obsoleto; los `docs/` se reescribieron contra el código que hay de verdad.
</details>

## Requisitos

Node `>=20.11`. Cinco dependencias par, todas obligatorias:

```
@nestjs/common    ^10.0.0 || ^11.0.0
@nestjs/core      ^10.0.0 || ^11.0.0
@nestjs/cqrs      ^10.0.0 || ^11.0.0
rxjs              ^7.2.0
reflect-metadata  ^0.1.13 || ^0.2.0
```

Que faltara `@nestjs/cqrs` es lo que hacía que la `2.0.0` reventara al importarla para todo el que no la hubiera instalado por su cuenta.

## Ejecutar las pruebas

```bash
npm install
npm test              # 42 suites, 1111 pruebas, ~12s
npm run test:e2e      # 17 pruebas sobre la superficie HTTP real
npm run test:cov:all  # ambas, combinadas en un informe — 85 % de líneas
npm run type-check
npm run lint
```

Las dos baterías cubren mitades distintas de la aplicación. `npm test` cubre el dominio — agregados, value objects, validadores. `npm run test:e2e` cubre el cableado, conduciendo controladores, handlers y el filtro de excepciones sobre HTTP real.

Informadas por separado, la capa de aplicación marcaba **0 %** mientras diecisiete pruebas e2e la estaban recorriendo. `test:cov:all` combina las dos, y eso lleva la cifra del 64 % al **85 %** — un fichero está cubierto si un test lo recorre, y cuál de los dos ejecutores lo hizo es un accidente de cómo repartiste las suites.

## Colaborar

Se buscan colaboraciones, y hay trabajo concreto y verificable esperando. Cada punto de abajo se confirmó ejecutándolo.

**Buenos primeros issues**, más o menos por orden de valor:

1. **Dale a `Order` un ciclo de vida más rico.** `Order.startProcessing()` existe en el agregado y ningún endpoint llega a él, así que `ship` y `deliver` son inalcanzables desde la API — ambos responden `409` desde `CONFIRMED`.
2. **Persiste algo.** Los repositorios en memoria son deliberados, pero una segunda implementación contra un almacén real demostraría que el contrato aguanta.

**Antes de abrir un PR**, CI ejecutará: ESLint, `prettier --check`, `tsc --noEmit` contra **ambos** `tsconfig.json` y `libs/ddd/tsconfig.lib.json`, pruebas unitarias con cobertura en Node 18 / 20 / 22, pruebas e2e, la construcción de la librería y `npm audit --audit-level=moderate`. Hoy pasan todas en local, así que el listón es alcanzable:

```bash
npm run lint && npm run type-check && npm run test:cov:all
```

Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/). Ojo: el hook de husky está inerte en un clon nuevo — `package.json` no tiene script `prepare` — así que de momento nada lo aplica en local. Arreglar eso es en sí mismo un PR bienvenido.

## Documentación

**[docs.nestjslatam.dev](https://docs.nestjslatam.dev)** — la guía completa en español, del primer value object a la referencia de API.

| Documento                                                                                      | Cubre                                                                              |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`libs/ddd/README.md`](libs/ddd/README.md)                                                     | El paquete publicado, al día en 4.0.0 — esto es lo que muestra npm                 |
| [`src/orders/README.md`](src/orders/README.md)                                                 | El módulo de Pedidos en detalle, fiel al controlador real                          |
| [`docs/order-aggregate-implementation.md`](docs/order-aggregate-implementation.md)             | Recorrido por el diseño del agregado                                               |
| [`docs/VALIDATORS_AND_STATES_IMPLEMENTATION.md`](docs/VALIDATORS_AND_STATES_IMPLEMENTATION.md) | Validadores y seguimiento de estado                                                |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                 | Cada versión, incluidas las dos obsoletas y por qué                                |
| [`docs/architecture.md`](docs/architecture.md)                                                 | Las cuatro capas, y por qué las dependencias apuntan hacia dentro                  |
| [`docs/getting-started.md`](docs/getting-started.md)                                           | Cómo ejecutarlo, y los tres errores que esta librería hace fáciles                 |
| [`docs/domain-layer.md`](docs/domain-layer.md)                                                 | Agregados, value objects, validadores, eventos de dominio                          |
| [`docs/application-layer.md`](docs/application-layer.md)                                       | Casos de uso, handlers, consultas, sagas                                           |
| [`docs/infrastructure-layer.md`](docs/infrastructure-layer.md)                                 | Repositorios, y por qué la persistencia está deliberadamente ausente               |
| [`docs/api-reference.md`](docs/api-reference.md)                                               | Cada endpoint, con los códigos de estado que devuelve de verdad                    |

> [!TIP]
> **[La guía completa del CLI →](https://github.com/nestjslatam/ddd-cli/blob/main/docs/GUIDE.md)** — cada comando y cada opción, recorridos construyendo un dominio completo desde cero hasta diez ficheros que compilan. Vale la pena leerla aunque nunca instales el CLI: es la explicación más clara del idioma de esta librería que existe, porque cada afirmación se produjo ejecutando la herramienta.

## Quiénes están detrás

Construido y mantenido por **[BeyondNet Tech](https://beyondnet.info/)** junto a la comunidad [NestJS Latam](https://nestjslatam.dev/).

- **[Evolith](https://github.com/beyondnetcode/evolith_arch32)** — gobierno de arquitectura ejecutable: un CLI, un servidor MCP y una API REST que comprueban un repositorio contra reglas Rego/OPA, y que informan de una regla que no pudieron evaluar como un fallo en lugar de dejarla pasar en silencio. La misma idea que `ddd validate`, un nivel por encima.
- **[Shell.ddd](https://github.com/beyondnetcode/Shell.ddd)** — la contraparte .NET de esta librería: entidades, raíces de agregado, value objects, eventos de dominio y reglas de negocio para C#.

## Licencia

MIT — ver [LICENSE](LICENSE).

---

<div align="center">

**Impulsado por [BeyondNetCode](https://beyondnet.info/)**

[Web](https://beyondnet.info/) · [GitHub](https://github.com/beyondnetcode) · [NestJS Latam](https://nestjslatam.dev/)

</div>
