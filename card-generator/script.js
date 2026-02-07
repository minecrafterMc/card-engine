const canvas = document.createElement("canvas");
const cardWidth = 250;
const cardHeight = 400;
const strokeWidth = 5;
const cardBackground = "#bbbbbb";
const detailColor = "#000000";
const outlineColor = "#FFFFFF";
const symbolSize = 50;
canvas.width = cardWidth+20;
canvas.height = cardHeight+20;
const ctx = canvas.getContext("2d");
function RandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
    function renderCard(shape,number){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if (number == "SPECIAL_BACK"){
            ctx.strokeStyle = detailColor;
            ctx.fillStyle = cardBackground;
            ctx.lineWidth = strokeWidth;
            ctx.beginPath();
            ctx.roundRect(10,10,cardWidth,cardHeight,20);
            
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            ctx.fillStyle = detailColor;
            ctx.font = "bold 48px serif";
            ctx.textAlign = "center";
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = 4;
            //ctx.strokeText("CARD",canvas.width/2,canvas.height/2-30);
            ctx.fillText("CARD",canvas.width/2,canvas.height/2-30);
            //ctx.strokeText("ENGINE",canvas.width/2,canvas.height/2+30);
            ctx.fillText("ENGINE",canvas.width/2,canvas.height/2+30);
            let img = document.createElement("img");
            img.src = canvas.toDataURL();
            return img;
        }
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = cardBackground;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.roundRect(10,10,cardWidth,cardHeight,20);
        
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        
        ctx.fillStyle = shape.color;
        ctx.textAlign = "left";
        ctx.font = "bold 48px serif";
        //ctx.strokeStyle = outlineColor;
        //ctx.strokeText(number,strokeWidth*2+25,strokeWidth*2+50);
        ctx.fillText(number,strokeWidth*2+25,strokeWidth*2+50);
        ctx.textAlign = "right";
        //ctx.strokeText(number,cardWidth-(strokeWidth*2),cardHeight-(strokeWidth*2));
        ctx.fillText(number,cardWidth-(strokeWidth*2),cardHeight-(strokeWidth*2));
        //ctx.fillRect(strokeWidth*2+15,strokeWidth*2+70+ctx.measureText(number).actualBoundingBoxDescent,50,50);
        ctx.drawImage(shape.img,strokeWidth*2+15,strokeWidth*2+70+ctx.measureText(number).actualBoundingBoxDescent,symbolSize,symbolSize);
        ctx.drawImage(shape.img,cardWidth-(strokeWidth*2)-50,cardHeight-(strokeWidth*2)-ctx.measureText(number).actualBoundingBoxDescent-90,symbolSize,symbolSize);
        ctx.moveTo(0,0);
        if (typeof number == "number" && number <= 10 && number > 0){
            for (let i = 0; i < number;i++){
                ctx.drawImage(shape.img,10+strokeWidth*2+ctx.measureText(number).actualBoundingBoxLeft+(i%5)*symbolSize/2,canvas.height/2-symbolSize/2+RandomInt(-10,10)+ ((i>=5) ? +symbolSize/2 : -symbolSize/2),symbolSize/2,symbolSize/2);
            }
        }
        else
            ctx.drawImage(shape.img,canvas.width/2-(symbolSize*3)/2,canvas.height/2-(symbolSize*3)/2,symbolSize*3,symbolSize*3)
        let img = document.createElement("img");
        img.src = canvas.toDataURL();
        return img;
    }
class shape{
    constructor(color,image,onload){
        this.color = color;
        this.img = document.createElement("img");
        this.img.src = image;
        this.img.onload = onload;
    }
}
class artShape extends shape{

}