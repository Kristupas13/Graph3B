
    // once everything is loaded, we run our Three.js stuff.
    $(function () {

        var stats = initStats();
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        var scene = new THREE.Scene();
        var cameraType = 'A';
        var move = false;
		var light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 10, 10, 10 ).normalize();
		scene.add(light);
        // create a camera, which defines where we're looking at.
		var camera = createAndSetupCamera();
        // create a render and set the size
        var webGLRenderer = new THREE.WebGLRenderer();
        webGLRenderer.setClearColor(0xEEEEEE, 1.0);
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        webGLRenderer.shadowMapEnabled = true;

        // add the output of the renderer to the html element
        $("#WebGL-output").append(webGLRenderer.domElement);


        // call the render function
        var step = 0;

        // the points group
        var spGroup;
        // the mesh
        var latheMesh;

        generatePoints(12);

        // setup the control gui
        var controls = new function () {
            // we need the first child, since it's a multimaterial

            this.segments = 12;
            this.phiStart = 0;
            this.phiLength = 2 * Math.PI;
			this.cameraFOV = 45;
            
            this.redraw = function () {
                scene.remove(spGroup);
                scene.remove(latheMesh);
                generatePoints(controls.segments);
            };
			
			this.changeCameraFOV = function() {
				camera.fov = controls.cameraFOV;
				camera.updateProjectionMatrix();
            }
        }

        var gui = new dat.GUI();
        gui.add(controls, 'segments', 0, 50).step(1).onChange(controls.redraw);
		gui.add(controls, 'cameraFOV', 20, 150).step(1).onChange(controls.changeCameraFOV);

        render();

        function generatePoints(segments) {
            var pointsX = [
		//1
		//2
		0, 8.6, 7.8, 7, 6.2, 5.5, 
		//3
		4.7, 3.7, 4.9, 3.7, 3.7,
		//4
		3.7, 4.9, 5.6, 4.4, 6.2, 
		//5
		2.5, 2.6, 2.7, 2.8, 2.9, 
		3.1, 3.3, 3.5, 3.7, 4, 
		//6
		4.3, 4.6, 4.9, 5.0, 6.5, 
		//7
		7.6, 8.1, 8.2, 7.5, 7.8, 
		//8
		7.8, 7.7, 0, 0 ];
		
		
		
		
		var pointsY = pointsX.map(function(input, i) {
			if (i == 0)
				return 10 + (i+1) * 12;
			
			if (i == pointsX.length - 1)
				return 10 + (i-1) * 12;
				
			return 10 + i * 12;
		});
		
	    // add 10 random spheres
            var points = [];
            var count = pointsX.length;
            for (var i = 0; i < count; i++) {
				var vector = new THREE.Vector3(pointsX[i], 0, (pointsY[count-1]-pointsY[i]-174)/10);
                points.push(vector);
				
            }

            spGroup = new THREE.Object3D();
            var material = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: false});
            points.forEach(function (point) {

                var spGeom = new THREE.SphereGeometry(0.2);
                var spMesh = new THREE.Mesh(spGeom, material);
                spMesh.position = point;
                spGroup.add(spMesh);
            });
            // add the points as a group to the scene
            scene.add(spGroup);

            // use the same points to create a latheGeometry
            //var latheGeometry = new THREE.LatheGeometry(points, Math.ceil(segments), phiStart, phiLength);
            var latheGeometry = new THREE.LatheGeometry(points, Math.ceil(segments), 0, 2 * Math.PI);
            latheMesh = createMesh(latheGeometry);
            var topKing = createTop(latheMesh);

            var kingas = new THREE.Group();
            kingas.add( latheMesh );
            kingas.add( topKing );
            kingas.name = 'king';

            scene.add(kingas);
            
            var floor = createFloor();
            scene.add(floor);
            
            this.camObject = createCamObject();
            scene.add(this.camObject);
        }

        function createMesh(geom) {

            // assign two materials
              var meshMaterial = new THREE.MeshLambertMaterial({color:0x654321, transparent:false});
            //var meshMaterial = new THREE.MeshNormalMaterial();
            meshMaterial.side = THREE.DoubleSide;
            var wireFrameMat = new THREE.MeshBasicMaterial();
            wireFrameMat.wireframe = true;

            // create a multimaterial
            var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);

            return mesh;
        }

        function render() {
            var king = scene.getObjectByName('king');
            var hasCamObject = scene.getObjectByName('camObject');
            if (!hasCamObject)
                scene.add(camObject);

            if (cameraType == 'C') {
                camera.position.x = camObject.position.x;
                camera.position.y = camObject.position.y;
                camera.position.z = camObject.position.z - 8;
                camera.lookAt(king.position);
                scene.remove(camObject);
            }


            camObject.lookAt(king.position);
            camera.updateProjectionMatrix();

            stats.update();

            spGroup.rotation.x = step;
            //latheMesh.rotation.x = step += 0.01;

            // render using requestAnimationFrame
            if (move) {
                step += 0.02;
                king.position.y = 14 * Math.cos(step);
                king.position.z = 1 + 6 * Math.abs(Math.sin(step));
            }
            webGLRenderer.render(scene, camera);
           // camera.lookAt(king.position);
            requestAnimationFrame(render);
        }

        function initStats() {

            var stats = new Stats();
            stats.setMode(0); // 0: fps, 1: ms

            // Align top-left
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';

            $("#Stats-output").append(stats.domElement);

            return stats;
        }
		
		function createAndSetupCamera() {
			var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0,100,50);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            camera.rotation.z = Math.PI;
			return camera;
        }
        
        function createFloor() {
            const geometrys = new THREE.BoxGeometry( 200, 200, 1 );
			var texture = THREE.ImageUtils.loadTexture("../assets/textures/table.jpg")
			var materials = new THREE.MeshPhongMaterial();
			materials.map = texture;
			const floor = new THREE.Mesh( geometrys, materials );
			floor.position.y = -75;
			floor.position.x = -37;
			floor.position.z = -17;
            
            return floor;
        }

        function createTop(king) {
            let geometry = new THREE.BoxGeometry( 1.5, 1.5, 13 );
            let geometry2 = new THREE.BoxGeometry( 6, 1.5, 1.5 );
            var material = new THREE.MeshLambertMaterial({color:0x654321, transparent:false});
            
            let cube1 = new THREE.Mesh( geometry, material );
            let cube2 = new THREE.Mesh( geometry2, material );

            cube1.position.set(king.position.x, king.position.y, king.position.z + 28);
            cube2.position.set(king.position.x, king.position.y, king.position.z + 32);
            

            //create a group and add the two cubes
            //These cubes can now be rotated / scaled etc as a group
            let group = new THREE.Group();
            group.add( cube1 );
            group.add( cube2 );
            
            return group;
        }

        function createCamObject() {
            var box = new THREE.Object3D;
            var mesh;
            var loader = new THREE.OBJLoader();
            loader.load('assets/models/camera.obj', function(geo) {
                mesh = geo;
                mesh.rotation.y = Math.PI;
                mesh.position.y = -11.3;
                box.add(mesh);
            });

            var axes = new THREE.AxisHelper(60);
            box.add(axes);
            box.rotation.y = Math.PI;
            var camObject = new THREE.Object3D();
            camObject.add(box);
            camObject.scale.set(0.3,0.3,0.3);
            camObject.position.y = 0;
            camObject.position.z = 80;
            camObject.name = "camObject";

            return camObject;
        }

        function setCameraA() {
            cameraType = 'A';
            camera.position.set(0,100,50);
            controls.cameraFOV = 45;
            controls.changeCameraFOV();
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            camera.rotation.z = Math.PI;

            camera.updateProjectionMatrix();
        }

        function setCameraB() {
            cameraType = 'B';

            cameraType = 'A';
            camera.position.set(0,100,0);
            controls.cameraFOV = 45;
            controls.changeCameraFOV();
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            camera.rotation.z = Math.PI;

            camera.updateProjectionMatrix();
        }

        function setCameraC() {
            cameraType = 'C';
        }

        var cam1Btn = document.getElementById("cam1");
        var cam2Btn = document.getElementById("cam2");
        var cam3Btn = document.getElementById("cam3");
        var moveBtn = document.getElementById("move");

        cam1Btn.addEventListener("click", function() {
            setCameraA();
        });

        cam2Btn.addEventListener("click", function() {
            setCameraB();
        });

        cam3Btn.addEventListener("click", function() {
            setCameraC();
        });
        
        moveBtn.addEventListener("click", function() {
            move = !move;
        });

    });