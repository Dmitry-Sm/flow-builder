<p align="center">
  <img src="https://github.com/Dmitry-Sm/flow-builder/raw/master/nodes_preview.jpg" alt="Preview" width="510" />
</p>

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
