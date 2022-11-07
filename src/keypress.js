export const handleKeyPress = (p, keyCode, cnv, seed) => {  
if(keyCode == 83){ // key "s"
    p.save(cnv, "artwork_" + seed +  ".png");
}
};
