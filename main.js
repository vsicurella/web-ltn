import { resetKeys, setKeyBlendMode, setShadingBlendMode } from './src/draw.js'
import { currentLtn } from './src/ltn.js'
import { convertImageToLtn, ImageToLtnConverter } from './src/image.js'

const converter = new ImageToLtnConverter('scale-image', 1300, 280);

document.body.onload = () => {
    //  resetKeys();
};
// document.getElementById("ltn-file").onchange = (function() {
//     currentLtn.loadFile(this.files[0]);
// });

document.getElementById("ltn-image").onchange = (function() {
    console.log(this)
    converter.setImageFile(this.files[0])
})

// window.setKeyBlendMode = setKeyBlendMode;
// window.setShadingBlendMode = setShadingBlendMode;