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
    render(){
        ctx.strokeStyle = this.shape.color;
        ctx.fillStyle = cardBackground;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.roundRect(10,10,cardWidth,cardHeight,20);
        
        ctx.fill();
        ctx.stroke();
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
var tests2 = new shape("#000000","test2.png")
function displayCard(number,shapee){
    var test = new card(shapee,number);
    document.body.appendChild(test.render());
    return test;
}
//displayCard(1);