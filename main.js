import { resetKeys, setKeyBlendMode, setShadingBlendMode } from './src/draw.js'
import { currentLtn } from './src/ltn.js'

document.body.onload = () => {
     resetKeys();
};
document.getElementById("ltn-file").onchange = (function() {
    currentLtn.loadFile(this.files[0]);
});

window.setKeyBlendMode = setKeyBlendMode;
window.setShadingBlendMode = setShadingBlendMode;