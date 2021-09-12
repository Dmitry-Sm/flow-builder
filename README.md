# flow-builder

Install [Parcel](https://parceljs.org/)
```sh
npm install -g parcel-bundler
```

Dependencies setup
```sh
npm install
```

Start app
```sh
parcel index.html
```


## Problems with three-mesh-ui:
In `node_modules\three-mesh-ui\src\content\MSDFText.js` replace
```sh
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
```
with
```sh
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
```
