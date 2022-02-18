import { refreshColor, renderToCanvas, resetKeys } from './src/draw.js'
import { currentLtn } from './src/ltn.js'

document.body.onload = () => {
     resetKeys()
     refreshColor();
     renderToCanvas();
};
document.getElementById("ltn-file").onchange = (function() {
    currentLtn.loadFile(this.files[0]);
});