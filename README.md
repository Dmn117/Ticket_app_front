# TicketsFrontend

# Estructura del proyecto a continuación

```
 src/
 │ 
 └───app/
 │
 ├───core/ # Servicios y elementos centrales de la aplicación
 │ ├───services/ # Servicios compartidos
 │ │ └───auth.service.ts # Servicio de autenticación (login, logout, etc.)
 │ └───guards/ # Guards para proteger rutas
 │ └───auth.guard.ts # Guard para proteger rutas según el estado de autenticación
 │
 ├───shared/ # Componentes, directivas, y pipes compartidos
 │ ├───components/ # Componentes reutilizables
 │ └───models/ # Definiciones de interfaces y tipos de datos
 │ └───user.interface.ts # Ejemplo de una interfaz (como para un usuario)
 │
 ├───modules/ # Módulos por características o secciones de la app
 │ ├───auth/ # Módulo de autenticación (login, registro, etc.)
 │ │ ├───login/ # Componente para el login
 │ │ │ ├───login.component.ts
 │ │ │ ├───login.component.html
 │ │ │ └───login.component.scss
 │ │ └───auth.module.ts # Módulo de autenticación
 │ │
 │ ├───orders/ # Sección para gestionar pedidos (ejemplo)
 │ │ ├───order-list/ # Componente de la lista de pedidos
 │ │ └───order-detail/ # Componente para detalles de un pedido
 │ └───dashboard/ # Componente de dashboard (ejemplo)
 │
 ├───pages/ # Componentes de páginas (como Home, Contacto, etc.)
 │ ├───home/
 │ ├───about/
 │ └───contact/
 │
 └───app.module.ts # Módulo principal de la aplicación

Que va en componentes???

Botones personalizados, modales, header, footer, cards, dialog, alerts, forms input generales

```

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.14.


## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build --prod` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.


