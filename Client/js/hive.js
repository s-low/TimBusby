"use strict";

console.log("hive.js starting");

addEventListener('load', start);

function start(){

    console.log("page loaded - starting");

    window.main_svg = document.getElementById('main_svg');
    window.mask = document.getElementById('mask_circle');
    window.svgPoint = main_svg.createSVGPoint();

    window.addEventListener('mousemove', run);
}

function run(e){
    var newPosition = cursorPosition(e);
    updateMask(newPosition);
}

function cursorPosition(e) {
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    
    // Transformation from "current user units to the screen coordinate system"
    var transform = main_svg.getScreenCTM().inverse();

    // Apply the transform to the svgpoint
    var newPoint = svgPoint.matrixTransform(transform); 
    
    return newPoint;
}

// Update the coordinates of the circle mask-area
function updateMask(newPosition) {
    mask.setAttribute('cx', newPosition.x);
    mask.setAttribute('cy', newPosition.y);
}