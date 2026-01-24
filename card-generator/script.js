const canvas = document.createElement("canvas");
const cardWidth = 250;
const cardHeight = 400;
const strokeWidth = 5;
const cardBackground = "#242424";
const detailColor = "#000000";
const symbolSize = 50;
const assetPath = "./assets";
canvas.width = cardWidth+20;
canvas.height = cardHeight+20;
const ctx = canvas.getContext("2d");
function RandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
class card{
    constructor(shape,number){
        this.shape = shape;
        this.number = number;
    }
    render(background){
        ctx.strokeStyle = this.shape.color;
        ctx.fillStyle = cardBackground;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.roundRect(10,10,cardWidth,cardHeight,20);

        ctx.stroke();
        ctx.fillStyle = ctx.createPattern(background,"no-repeat");
        ctx.fill();
        ctx.fillStyle = this.shape.color;
        ctx.textAlign = "left";
        ctx.font = "bold 48px serif";
        ctx.fillText(this.number,strokeWidth*2+25,strokeWidth*2+50);
        ctx.textAlign = "right";
        ctx.fillText(this.number,cardWidth-(strokeWidth*2),cardHeight-(strokeWidth*2));
        //ctx.fillRect(strokeWidth*2+15,strokeWidth*2+70+ctx.measureText(this.number).actualBoundingBoxDescent,50,50);
        ctx.drawImage(this.shape.img,strokeWidth*2+15,strokeWidth*2+70+ctx.measureText(this.number).actualBoundingBoxDescent,symbolSize,symbolSize);
        ctx.drawImage(this.shape.img,cardWidth-(strokeWidth*2)-50,cardHeight-(strokeWidth*2)-ctx.measureText(this.number).actualBoundingBoxDescent-90,symbolSize,symbolSize);
        if (typeof this.number == "number" && this.number <= 10){
            for (let i = 0; i < this.number;i++){
                ctx.drawImage(this.shape.img,10+strokeWidth*2+ctx.measureText(this.number).actualBoundingBoxLeft+(i%5)*symbolSize/2,canvas.height/2-symbolSize/2+RandomInt(-10,10)+ ((i>=5) ? +symbolSize/2 : -symbolSize/2),symbolSize/2,symbolSize/2);
            }
        }
        else
            ctx.drawImage(this.shape.img,canvas.width/2-(symbolSize*3)/2,canvas.height/2-(symbolSize*3)/2,symbolSize*3,symbolSize*3)
        let img = document.createElement("img");
        img.src = canvas.toDataURL();
        return img;
    }
    renderWithoutCreatingImage(background){
        ctx.strokeStyle = this.shape.color;
        ctx.fillStyle = cardBackground;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.roundRect(10,10,cardWidth,cardHeight,20);

        ctx.stroke();
        ctx.fillStyle = ctx.createPattern(background,"no-repeat");
        ctx.fill();
        ctx.fillStyle = this.shape.color;
        ctx.textAlign = "left";
        ctx.font = "bold 48px serif";
        ctx.fillText(this.number,strokeWidth*2+25,strokeWidth*2+50);
        ctx.textAlign = "right";
        ctx.fillText(this.number,cardWidth-(strokeWidth*2),cardHeight-(strokeWidth*2));
        //ctx.fillRect(strokeWidth*2+15,strokeWidth*2+70+ctx.measureText(this.number).actualBoundingBoxDescent,50,50);
        ctx.drawImage(this.shape.img,strokeWidth*2+15,strokeWidth*2+70+ctx.measureText(this.number).actualBoundingBoxDescent,symbolSize,symbolSize);
        ctx.drawImage(this.shape.img,cardWidth-(strokeWidth*2)-50,cardHeight-(strokeWidth*2)-ctx.measureText(this.number).actualBoundingBoxDescent-90,symbolSize,symbolSize);
        if (typeof this.number == "number" && this.number <= 10){
            for (let i = 0; i < this.number;i++){
                ctx.drawImage(this.shape.img,10+strokeWidth*2+ctx.measureText(this.number).actualBoundingBoxLeft+(i%5)*symbolSize/2,canvas.height/2-symbolSize/2+RandomInt(-10,10)+ ((i>=5) ? +symbolSize/2 : -symbolSize/2),symbolSize/2,symbolSize/2);
            }
        }
        else
            ctx.drawImage(this.shape.img,canvas.width/2-(symbolSize*3)/2,canvas.height/2-(symbolSize*3)/2,symbolSize*3,symbolSize*3)
        
    }
}
class shape{
    constructor(color,image){
        this.color = color;
        this.img = document.createElement("img");
        this.img.src = assetPath + "/"+image;
    }
}
class artShape extends shape{

}
var tests = new shape("#FF0000","test.png");
var tests2 = new shape("#000000","test2.png");
var badFrames = [];
var loaded = 0;
var recorder = new MediaRecorder(canvas.captureStream(), { mimeType: "video/webm" });
var chunks = [];
recorder.ondataavailable = function(e) {
    if (e.data.size > 0)
        chunks.push(e.data);
};
recorder.onstop = function(e) {
    var blob = new Blob(chunks, { 'type' : 'video/webm; codecs=vp9' });
    chunks = [];
    var videoURL = URL.createObjectURL(blob);
    var video = document.getElementById("bad");
    video.src = videoURL;
}
function to4Digits(number){
    let str = number.toString();
    while (str.length < 4){
        str = "0" + str;
    }
    return str;
}
function makeBadApple(){
    for (let i = 1; i <= 6572; i++){
        var img = document.createElement("img");
        img.width = cardWidth;
        img.height = cardHeight;
        img.src = "./assets/frames/output_"+to4Digits(i)+".jpg";
        badFrames.push(img);
        img.onload = function(){
            loaded++;
        }
    }
}
function playBadApple(){
    if (loaded < badFrames.length){
        setTimeout(playBadApple,1000);
        return;
    }
    recorder.start();
    document.body.appendChild(canvas);
    continueBadApple(0);
}
function continueBadApple(frame){
    
    new card(tests,frame).renderWithoutCreatingImage(badFrames[frame]);

    setTimeout(continueBadApple,33,frame+1);
    if (frame >= badFrames.length-1){
        recorder.stop();
        return;
    }
}
function displayCard(number,shapee,background){
    var test = new card(shapee,number);
    document.body.appendChild(test.render(background));
    return test;
}
//displayCard(1);