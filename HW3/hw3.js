var canvas;
var gl;
var choose=0; // Choosing element for proper render function
var cameravariable = 0; //Choosing element for proper eye function, 
                       //bcz we change eye functions at documentgetElemet parts
var fovyvariable=0; // We defined this variable for fovy to get new projection matrix
                    // with perspective projection matrix 

var numTimesToSubdivide = 3;
 
var index = 0;

var pointsArray = [];
var normalsArray = [];


var near = 0.3;
var far = 11;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;


var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var light={
	lightX:0.0,
	lightY:10.0,
	lightZ:0.0
}
var lightPosition = vec4(light.lightX, light.lightY, light.lightZ, 1.0);
var lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
var lightDiffuse = vec4( 8.0, 8.0, 8.0, 8.0 );
var lightSpecular = vec4( 9.0, 9.0, 9.0, 1.0 );

var materialAmbient = vec4(  0.41,0.41, 0.41, 1.0 );
var materialDiffuse = vec4( 0.41,0.41, 0.41, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 9;

//var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix, perspectiveMatrix;
var modelViewMatrixLoc, projectionMatrixLoc,perspectiveMatrixLoc ;
var normalmatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var colorArray1 = {
    red: 0,
    green:0,
    blue: 0
}
var colorLoc; 
var  fovy = 45.0; 
var  aspect = 1.0;

function triangle(a, b, c) {     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);
    
     // normals are vectors     
     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);

     index += 3;     
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "gouraudvertex-shader", "gouraudfragment-shader" );
    gl.useProgram( program );
    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);    

    document.getElementById("Button0").onclick = function(){
        numTimesToSubdivide++; 
        index = 0;
        pointsArray = []; 
        normalsArray = [];
        init();
    };
    document.getElementById("Button1").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = []; 
        normalsArray = [];
        init();
		
    };
	document.getElementById("redSlider1").oninput = function(event) {
        colorArray1.red = event.srcElement.value;
    };
    document.getElementById("greenSlider1").oninput = function(event) {
        colorArray1.green = event.srcElement.value;
    };
    document.getElementById("blueSlider1").oninput = function(event) {
        colorArray1.blue = event.srcElement.value;
    };
	document.getElementById("beta").oninput = function(event) {
        materialShininess = event.srcElement.value;
		init();
    };
	document.getElementById("fovy").oninput = function(event) {
        fovy = event.srcElement.value;
		fovyvariable= 1;
		init();
		
    };
	document.getElementById("cameraX").oninput = function(event) {
        var camx = event.srcElement.value;
		eye = vec3(camx,radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
		cameravariable =1;
		init();
    };
	document.getElementById("cameraY").oninput = function(event) {
        var camy = event.srcElement.value;
		eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        camy, radius*Math.cos(theta));
		cameravariable =1;
		init();
    };
	document.getElementById("cameraZ").oninput = function(event) {
        var camz = event.srcElement.value;
		eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), camz);
		cameravariable =1;
		init();
    };
	document.getElementById("lightX").oninput = function(event) {
         light.lightX = event.srcElement.value;
		 init();
    };
	document.getElementById("lightY").oninput = function(event) {
         light.lightY = event.srcElement.value;
		 init();
    };
	document.getElementById("lightZ").oninput = function(event) {
        light.lightZ = event.srcElement.value;
		init();
    };
	document.getElementById("shading").onclick = function(event) {
		switch(event.target.index){
			case 0:
			var program = initShaders( gl, "gouraudvertex-shader", "gouraudfragment-shader" );
			gl.useProgram( program );
			modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
			projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
			normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
			ambientProduct = mult(lightAmbient, materialAmbient);
			diffuseProduct = mult(lightDiffuse, materialDiffuse);
			specularProduct = mult(lightSpecular, materialSpecular);

			gl.uniform4fv( gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct) );
			gl.uniform4fv( gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct) );
			gl.uniform4fv( gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct) );	
			gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(light) );
			gl.uniform1f( gl.getUniformLocation(program,"shininess"),materialShininess );
			colorLoc = gl.getUniformLocation(program, "color");
			choose=0;
			init();
			
			
				break; 
			case 1:
			var program = initShaders( gl, "phongvertex-shader", "phongfragment-shader" );
			gl.useProgram( program );
			modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
			projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
			normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
			ambientProduct = mult(lightAmbient, materialAmbient);
			diffuseProduct = mult(lightDiffuse, materialDiffuse);
			specularProduct = mult(lightSpecular, materialSpecular);

			gl.uniform4fv( gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct) );
			gl.uniform4fv( gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct) );
			gl.uniform4fv( gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct) );	
			gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(light) );
			gl.uniform1f( gl.getUniformLocation(program,"shininess"),materialShininess );
			colorLoc = gl.getUniformLocation(program, "color");
			choose=0;
			init();
		       break;
			case 2:
			var program = initShaders( gl, "wirevertex-shader", "wirefragment-shader" );
			gl.useProgram( program );
			modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
			projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
			colorLoc = gl.getUniformLocation(program, "color");
			choose=1;
			init();
		       break;
			
        } 

    };
	

	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	//perspectiveMatrixLoc = gl.getUniformLocation(program, "perspectiveMatrix");
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
	lightPositionLoc = gl.getUniformLocation(program,"lightPosition");
	
	ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(light) );
    gl.uniform1f( gl.getUniformLocation(program,"shininess"),materialShininess );
	
	colorLoc = gl.getUniformLocation(program, "color");
	if(choose==1){
		render2();
	}
	else{
		render();
	}
	
   
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(cameravariable==0){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    }
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    perspectiveMatrix = perspective(fovy,aspect,near,far);
	if(fovyvariable = 1){
	projectionMatrix = perspectiveMatrix;
	}
    // normal matrix only really need if there is nonuniform scaling
    // it's here for generality but since there is
    // no scaling in this example we could just use modelView matrix in shaders  
	normalmatrix = normalMatrix(modelViewMatrix, true);
            
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	//gl.uniformMatrix4fv(perspectiveMatrixLoc, false, flatten(perspectiveMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalmatrix) );
	gl.uniform4fv(lightPositionLoc, vec4(light.lightX, light.lightY, light.lightZ, 1.0));
    gl.uniform4fv(colorLoc, vec4(colorArray1.red, colorArray1.green, colorArray1.blue, 1.0))    
    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );

    window.requestAnimFrame(render);
}
function render2() {
	
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(cameravariable==0){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    }
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	perspectiveMatrix = perspective(fovy,aspect,near,far);
	if(fovyvariable = 1){
	projectionMatrix = perspectiveMatrix;
	}
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
        

    gl.drawArrays( gl.LINE_LOOP, 0, pointsArray.length );

    window.requestAnimFrame(render2);
	
	
}
