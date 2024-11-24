const canvas = document.getElementById('myCanvas')
const c = canvas.getContext('2d')

// document elements
const modal = document.getElementById('modal')
const buttonCreateFourStrings = document.getElementById('buttonCreateFourStrings')
const buttonCreateSixStrings = document.getElementById('buttonCreateSixStrings')
const buttonCreateEightStrings = document.getElementById('buttonCreateEightStrings')

// Constants
const notes = ['a','a#','b','c','c#','d','d#','e','f','f#','g','g#']
const intervals_global = ['root','third','fourth','fifth','seventh']
let whatIntervalIsPositionedWhenClicking = 'root'

//#region PARAMETRES
// Parametres
const numberOfFrets = 12
const nutPositionHorizontal = 20
const metalbarDistance = 50
const metalbarThickness = 1
const metalbarOverhang = 10
const nutThickness = 3
const nutOverhang = 15
const markLineThickness = 1
const markRadius = 10
const noteFont =  "11px verdana";
const noteTextDistance = {
    x: 3,
    y: 3
}
const intervalOverlayOffset = {
    x: 5, 
    y: 3
}
// colours
const noteColour = 'rgba(120,120,120,0.8)'
const metalbarColour = 'rgba(150,150,150,0.8)'
const markColour = 'rgba(12,12,12,0.4)'
const ghostColour = 'rgba(12,12,12,0.1)'
const intervalColours = {
    root: 'rgba(250,0,0,0.5)',
    third: 'rgba(250,125,0,0.3)', 
    fourth: 'rgba(250,250,0,0.3)',
    fifth: 'rgba(250,0,125,0.3)',
    seventh: 'rgba(250,0,250,0.3)'
}
const intervalColoursSolidEquivalent = {
    root: 'rgb(253, 128, 128)',
    third: 'rgb(254,216,179)', 
    fourth: 'rgb(254,254,179)', 
    fifth: 'rgb(254,179,216)', 
    seventh: 'rgb(254,179,254)'
}
const focusWindowColour = 'rgba(50,150,175,0.7)'
//#endregion




//#region BUTTONS AND LISTENERS
const buttonWriteNotes = document.getElementById('button_write_notes')
const buttonWriteIntervals = document.getElementById('button_write_intervals')
const buttonColourIntervals = document.getElementById('button_colour_intervals')
const buttonFocusWindow = document.getElementById('buttonFocusWindow')

canvas.addEventListener('mousemove', (e)=>{
    guitar.clearHover()
    const mouseOverFret = guitar.detectFret({x: e.offsetX, y: e.offsetY})
    if (mouseOverFret){
        mouseOverFret.ghost = true
        guitar.refreshScreen()
    } 
    
})

canvas.addEventListener('mouseout', (e)=>{
    guitar.clearHover()
    guitar.refreshScreen()
})

//// Click canvas
canvas.addEventListener('click', (e) => {
    const clicked = guitar.detectFret({x: e.offsetX, y: e.offsetY})
    if (!clicked) {return}
    const string = clicked.string
    const number = clicked.number
    const stringPitch = string.pitch
    const indexOfNoteClicked = (notes.indexOf(stringPitch) + number) % 12
    const noteClicked = notes[indexOfNoteClicked]
    const intervalPositioned = guitar.scale[whatIntervalIsPositionedWhenClicking]
    /// avoid negatives in modulo
    const dividend = indexOfNoteClicked - intervalPositioned.steps
    const divisor = 12
    const adjustedIndex = ((dividend % divisor) + divisor) % divisor

    const rootAfterAdjustment = notes[adjustedIndex]
    guitar.setRootAt(rootAfterAdjustment)
    guitar.setFocusWindow(clicked)
    guitar.refreshScreen()
})  

//// write notes
buttonWriteNotes.addEventListener('click', ()=> {
    guitar.show.notes = !guitar.show.notes
    if (guitar.show.notes) {buttonWriteNotes.classList.add('button_on')}
    else {buttonWriteNotes.classList.remove('button_on')}

    // can't have notes and interval symbols at the same time
    if (guitar.show.notes && guitar.show.intervalSymbols){
        buttonWriteIntervals.click()
    }

    guitar.refreshScreen()
})

//// write interval symbols
buttonWriteIntervals .addEventListener('click', ()=> {
    guitar.show.intervalSymbols = !guitar.show.intervalSymbols
    if (guitar.show.intervalSymbols) {buttonWriteIntervals.classList.add('button_on')}
    else {buttonWriteIntervals.classList.remove('button_on')}

    // can't have notes and interval symbols at the same time
    if (guitar.show.notes && guitar.show.intervalSymbols){
        buttonWriteNotes.click()
    }

    guitar.refreshScreen()
})


/// Colour Intervals
buttonColourIntervals.addEventListener('click', ()=>{
    guitar.show.intervalColours = !guitar.show.intervalColours
    if (guitar.show.intervalColours){
        buttonColourIntervals.classList.add('button_on')
    } else {
        buttonColourIntervals.classList.remove('button_on')
    }

    // Individual interval buttons
    if (guitar.show.intervalColours) {
        turn_visibility('on', intervals_global)
    } else {
        turn_visibility('off', intervals_global)
    }
    guitar.refreshScreen()
})

function turn_visibility(direction, ints){
    for (const int of ints){
        const buttonName = "button_colour_" + int
        const button = document.getElementById(buttonName)
        if (direction === 'on' && (!button.style.backgroundColor) ||
            direction === 'off' && (button.style.backgroundColor)
        )  {
            button.click()}
    }
}

// create interval buttons (to determine their visibility)
function listener_interval(int){
    const buttonName = "button_colour_" + int
    const button = document.getElementById(buttonName)
    button.addEventListener('click', ()=>{
        guitar.scale[int].toggleVisibility()
        
        if (guitar.scale[int].isVisible) {
            button.style.backgroundColor = intervalColoursSolidEquivalent[int]
        } else {
            button.style.removeProperty('background-color')
        }
        guitar.refreshScreen()
    })
}
listener_interval('root')
listener_interval('third')
listener_interval('fourth')
listener_interval('fifth')
listener_interval('seventh')


// Focus window 
buttonFocusWindow.addEventListener('click', () => {
    guitar.show.focusWindow = !guitar.show.focusWindow
    guitar.setFocusWindow()
    if (guitar.show.focusWindow){
        buttonFocusWindow.classList.add('button_on')
    } else {
        buttonFocusWindow.classList.remove('button_on')
    }
    guitar.refreshScreen()
})


// Select what to position on click
const select = document.getElementById('selectWhatToPosition')
select.style.backgroundColor = intervalColoursSolidEquivalent.root
select.addEventListener('change', ()=>{
    whatIntervalIsPositionedWhenClicking = select.options[select.selectedIndex].textContent
    document.getElementById('selectWhatToPosition').style.backgroundColor = intervalColoursSolidEquivalent[whatIntervalIsPositionedWhenClicking]

})


/// create guitar button
buttonCreateFourStrings.addEventListener('click',()=>{
    setupGuitar(4)
    removeModal()
})
buttonCreateSixStrings.addEventListener('click',()=>{
    setupGuitar(6)
    removeModal()
})

buttonCreateEightStrings.addEventListener('click',()=>{
    setupGuitar(8)
    removeModal()
})

function removeModal(){
    modal.remove()
}


// colour the dropdwon menu of options
for (const interval of intervals_global){
    document.getElementById(`option_${interval}`).style.backgroundColor = intervalColoursSolidEquivalent[interval]
}


//#endregion




//#region CLASSES

class Guitar{
    constructor(){
        this.strings = []
        this.frets = []
        this.scale
        this.scaleNotes = []
        this.rootStartsAt = undefined
        this.distanceBetweenStrings = 40
        this.show ={
            notes: true,
            intervalSymbols: false,
            intervalColours: true,
            roots: true,
            focusWindow: false,
        }
        this.focusWindowCentre = undefined
        this.metalbars = []
    }

    drawStrings(){
        for(const string of this.strings){
            string.draw()
        }
    }

    createScale(){
        this.scale = new Scale()
    }
    // the string position calculated on creation is not correct, 
    // because this.strings.length changes every time a new string is created
    // This formulate updates all string positions 
    updateDistanceBetweenStrings(){
        this.distanceBetweenStrings = canvas.height / (this.strings.length + 1)
        for (const string of this.strings){
            string.start.y = canvas.height - this.distanceBetweenStrings - (this.strings.indexOf(string) * this.distanceBetweenStrings)
            string.end.y = string.start.y
            for (const fret of string.frets){
                fret.start.y = string.start.y - this.distanceBetweenStrings/2
                fret.end.y = string.end.y + this.distanceBetweenStrings/2
            }
        }
    } 

    createMetalbars(){
        for (let i = 0 ; i <= numberOfFrets; i++){
            const metalbar = new Metalbar(i)
            this.metalbars.push(metalbar)
        }
    
    }

    drawMetalbars(){
        for (const metalbar of this.metalbars){
            metalbar.draw()
        }
    }
    
    drawMarks(double){
        for (let position = 4 ; position < 11; position += 2){
            c.lineWidth = markLineThickness
            c.strokeStyle = markColour
            c.beginPath();
            c.arc( (position * metalbarDistance) - metalbarDistance/2, canvas.height/2, markRadius, 0, 2 * Math.PI);
            c.stroke();
        }
        // double circle
        const position = 13
        c.beginPath();
        c.arc((position * metalbarDistance)  - metalbarDistance/2, canvas.height/2 - markRadius , markRadius, 0, 2 * Math.PI);
        c.stroke();
        //second circle
        c.beginPath();
        c.arc((position * metalbarDistance)  - metalbarDistance/2, canvas.height/2 + markRadius , markRadius, 0, 2 * Math.PI);
        c.stroke();
        c.strokeStyle = 'black'
    }
    
    detectFret({x, y}){
        for (const fret of this.frets){
                if (
                    x >= fret.start.x && 
                    x <= fret.end.x && 
                    y >= fret.start.y && 
                    y <= fret.end.y 
                ){
                    return fret
                } 
        }
    }

    clearHover(){
        for (const fret of this.frets){
            fret.ghost = false
        }
    }

    drawNotes(){
        for (const string of this.strings){
            string.drawNotes()
        }
    }

    drawIntervalSymbols(){
        for (const string of this.strings){
            string.drawIntervalSymbol()
        }
    }
   
    drawIntervalColours(){
        for (const fret of this.frets){
            if (fret.interval && fret.interval.isVisible){
                fret.drawInterval()
            }
        }
    }
    
    setRootAt(note){
        this.rootStartsAt = note
        
        /// clear the invervals of all the frets
        for (const fret of this.frets){
            fret.interval = undefined
        }
        /// attach the interval to all the frets
        for (const interval of this.scaleNotes){
            const nextIntervalNote = notes[(notes.indexOf(this.rootStartsAt) + interval.steps) % 12] 
            for (const fret of this.frets){
                if (fret.note === nextIntervalNote){
                    fret.interval = interval
                }
            }
        }
    }

    setFocusWindow(clicked){
        if(this.show.focusWindow){
            this.focusWindowCentre = clicked
        } else {
            this.focusWindowCentre = undefined
        }
    }

    drawFocusWindow(){
        const width = this.focusWindowCentre.end.x - this.focusWindowCentre.start.x
        const height = this.focusWindowCentre.end.y - this.focusWindowCentre.start.y
        const topLeft = {
            x: this.focusWindowCentre.start.x - width * 3, 
            y: this.focusWindowCentre.start.y - height
        }
        const topRight = {
            x: topLeft.x + 7 * width,
            y: topLeft.y
        }
        const bottomRight = {
            x: topRight.x,
            y: topLeft.y + 3 * height
        }
        const bottomLeft = {
            x: topLeft.x,
            y: bottomRight.y
        }

        c.fillStyle = focusWindowColour
        c.fillRect(0,0,canvas.width, topLeft.y)
        c.fillRect(0,topLeft.y, topLeft.x, bottomLeft.y - topLeft.y)
        c.fillRect(topRight.x,topRight.y, canvas.width - topRight.x, bottomLeft.y - topLeft.y)
        c.fillRect(0,bottomLeft.y, canvas.width, canvas.height - bottomLeft.y)
        /// If you wnant an outline instead
        // c.lineWidth = 3
        // c.strokeStyle = focusWindowColour
        // c.beginPath()
        // c.moveTo(topLeft.x, topLeft.y)
        // c.lineTo(topRight.x, topRight.y)
        // c.lineTo(bottomRight.x, bottomRight.y)
        // c.lineTo(bottomLeft.x, bottomLeft.y)
        // c.closePath()
        // c.stroke()
        // c.strokeStyle = 'black'
    }   

    refreshScreen(){
        c.clearRect(0, 0, canvas.width, canvas.height);
        this.drawMetalbars()
        this.drawStrings() 
        if (this.show.notes){
            this.drawNotes()
        } else if (this.show.intervalSymbols){
            this.drawIntervalSymbols()
        }

        this.drawMarks()
        this.drawIntervalColours()

        // ghost
        for (const fret of this.frets){
            if (fret.ghost){
                fret.draw()
            }
        }

        // focusWindow
        if (this.focusWindowCentre){
            this.drawFocusWindow()
        }
    }

}

class String{
    constructor({pitch, thickness = 2, addToBottom = false}){
        if (!addToBottom){
            guitar.strings.push(this)
        } else {
            guitar.strings.unshift(this)
        }
        this.pitch = pitch
        this.thickness = thickness
        this.start = {
            x: 10, 
            y: undefined // defined after strings are created via guitar.updateDistanceBetweenStrings(){
        }
        this.end = {
            x: canvas.width, 
            y: this.start.y,
        }
        this.frets = []

        this.createFrets()
    }

    draw(){
        c.lineWidth = this.thickness
        c.beginPath()
        c.moveTo(this.start.x, this.start.y)
        c.lineTo(this.end.x, this.end.y)
        c.stroke()
    }

    drawNotes(){
        for (const fret of this.frets){
            c.fillStyle = noteColour
            c.font = noteFont
            c.fillText(fret.note, fret.start.x + metalbarDistance/2 - noteTextDistance.x, this.start.y  - noteTextDistance.y);
            c.fillStyle = 'black'        }
    }

    drawIntervalSymbol(){
        for (const fret of this.frets){
            if (fret.interval){
                c.fillStyle = noteColour
                c.font = noteFont
                c.fillText(fret.interval.symbol, fret.start.x + metalbarDistance/2 - noteTextDistance.x, this.start.y  - noteTextDistance.y);
                c.fillStyle = 'black'       
            }
        }
    }

    createFrets(){
        for (let i = 0 ; i <= numberOfFrets; i++){
            const fret = new Fret({
                string: this,
                start: {
                    x: i *  metalbarDistance,
                    y: this.start.y - guitar.distanceBetweenStrings/2
                }, 
                end: {
                    x: (i *  metalbarDistance) + metalbarDistance,  
                    y: this.end.y + guitar.distanceBetweenStrings/2
                }, 
                note: notes[(notes.indexOf(this.pitch) + this.frets.length) % 12], 
                number: this.frets.length,
            })

          
        }
 
    }

}

class Metalbar{
    constructor(number){
        this.number = number

        this.start = {
            x: (this.number *  metalbarDistance) + metalbarDistance,
            y: guitar.strings[guitar.strings.length-1].start.y - metalbarOverhang, 
        }
        this.end = {
            x: this.start.x, 
            y: guitar.strings[0].start.y + metalbarOverhang, 
        }
    }

    draw(){
        c.lineWidth = metalbarThickness
        if (this.number === 0){
            c.lineWidth = nutThickness
        }
        c.strokeStyle = metalbarColour
        c.beginPath()
        c.moveTo(this.start.x, this.start.y)
        c.lineTo(this.end.x, this.end.y)
        c.stroke()
        c.strokeStyle = 'black'
    }
}

class Nut extends Metalbar{
    constructor(){
        super(0)
    }

    draw(){
        c.lineWidth = nutThickness
        c.beginPath()
        c.moveTo(this.start.x, this.start.y - nutOverhang)
        c.lineTo(this.end.x, this.end.y + nutOverhang)
        c.stroke()
    }
}

class Fret{
    constructor({string, start, end, note, number}){
        this.string = string
        this.string.frets.push(this)
        guitar.frets.push(this)
        this.ghost = false
        this.start = start
        this.end = end, 
        this.note = note, 
        this.number = number
        this.interval = undefined
    }

    draw() {
        c.fillStyle = ghostColour
        c.fillRect(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y -  this.start.y)
    } 


    drawInterval(){
        c.fillStyle = this.interval.colour
        c.fillRect(
            this.start.x + intervalOverlayOffset.x , 
            this.start.y + intervalOverlayOffset.y, 
            this.end.x - this.start.x - (2 * intervalOverlayOffset.x), 
            this.end.y -  this.start.y - (2 * intervalOverlayOffset.y))
        }

}

class Scale{
    constructor(){
        this.root = new PentatoncInterval({steps:0, name:'root', symbol: 'P1'})
        this.third = new PentatoncInterval({steps:3, name:'third', symbol: 'm3'})
        this.fourth = new PentatoncInterval({steps:5, name:'fourth', symbol: 'P4'})
        this.fifth = new PentatoncInterval({steps:7, name:'fifth', symbol: 'P5'})
        this.seventh = new PentatoncInterval({steps:10, name:'seventh', symbol: 'm7'})
    }
}


class PentatoncInterval{
    constructor({name, steps, colour, symbol}){
        guitar.scaleNotes.push(this)
        this.name = name
        this.symbol = symbol
        this.steps = steps
        this.note = undefined
        this.colour = intervalColours[this.name]
        this.isVisible = true
        this.initialColour()
    }

    initialColour(){
        const buttonName = "button_colour_" + this.name
        const button = document.getElementById(buttonName)
        button.style.backgroundColor = this.colour
    }

    toggleVisibility(){
        this.isVisible = !this.isVisible
    }
}

//#endregion Classes




//#region INITIATE
// create strings
const guitar = new Guitar()
function setupGuitar(stringNumber){
    if (stringNumber === 8){
        const string_fsharp = new String({pitch: 'f#'})
        const string_blow = new String({pitch: 'b'})
    }
    const string_e = new String({pitch: 'e', thickness: 4})
    const string_a = new String({pitch: 'a', thickness: 3})
    const string_d = new String({pitch: 'd', thickness: 3})
    const string_g = new String({pitch: 'g', thickness: 2})
    
    if (stringNumber === 6){
        const string_b = new String({pitch: 'b', thickness: 2})
        const string_ehigh = new String({pitch: 'e', thickness: 1})
    }

    guitar.updateDistanceBetweenStrings()
    guitar.createMetalbars()
    guitar.createScale()
    guitar.drawMarks()
    guitar.refreshScreen()
}
//#endregion INITIATE


            
