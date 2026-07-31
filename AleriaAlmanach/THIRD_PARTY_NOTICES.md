# Third-Party Notices

The Aleria Almanach dice feature includes the following third-party software.

## Runtime dependencies

| Package | Version | License | Purpose |
| --- | ---: | --- | --- |
| `@3d-dice/dice-box` | 1.1.4 | MIT | 3D rendering, physics and physical dice results |
| `@3d-dice/dice-parser-interface` | 0.2.1 | MIT | Interface between advanced notation and Dice Box |
| `@3d-dice/dice-roller-parser` | 0.2.6 | MIT | Roll20-compatible notation parser (transitive) |
| `@babylonjs/core` | 5.57.1 | Apache-2.0 | 3D engine used by Dice Box (transitive) |
| `@babylonjs/loaders` | 5.57.1 | Apache-2.0 | Model loading used by Dice Box (transitive) |
| `@babylonjs/materials` | 5.57.1 | Apache-2.0 | Dice materials used by Dice Box (transitive) |

Dice Box and Dice Parser Interface are Copyright (c) 2021 3D Dice.
Dice Roller Parser is Copyright (c) Ben Morton and contributors.
Babylon.js is Copyright (c) Microsoft Corporation and contributors.

The bundled default Dice Box theme and models are distributed with
`@3d-dice/dice-box`. Their upstream project is
<https://github.com/3d-dice/dice-box>.

The complete MIT license text for the 3D Dice packages is stored in
[`licenses/3d-dice-MIT.txt`](licenses/3d-dice-MIT.txt). The complete Apache
License 2.0 text shipped by Babylon.js is stored in
[`licenses/BabylonJS-Apache-2.0.md`](licenses/BabylonJS-Apache-2.0.md).

## Build and test dependencies

`vite` 8.2.0 and `esbuild` 0.28.1 are used only to build and test the project.
Both are licensed under the MIT License and are not copied as standalone
runtime packages into the published application.
