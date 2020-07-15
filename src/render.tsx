import React, { useEffect, useState } from 'react'
import { CanvasManager } from './canvas'
import * as THREE from 'three'
// import { TrackballControls } from './traceballctrl'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Box3, Group, Mesh, BufferGeometry, BufferAttribute, MeshBasicMaterial, Color } from 'three'
// import { DragControls } from 'three/examples/jsm/controls/DragControls'

interface RenderProps {
    ctrlPointsDims: [number, number, number]
    scene:string
}

interface STU {
    object: Mesh
    stu: Float32Array
}

const Render : React.FC<RenderProps> = (props)=>{
    const [handle, setHandle] = useState<ReturnType<typeof RunAll>>()
    useEffect(()=>{
        setHandle(RunAll())
    }, [])
    useEffect(()=>{
        if(handle){
            const dims = props.ctrlPointsDims
            handle.updateCtrlDims(...dims)
        }
    }, [props.ctrlPointsDims])

    useEffect(()=>{
        if(handle) {
            handle.updateScene(props.scene)
        }
    }, [props.scene])

    return (null)
}

export default Render;



function RunAll () {
const HandleResize = ()=>{Resize()}
const frame = document.getElementById('canvas-frame'); if(frame === null) return;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias : true, powerPreference:'high-performance'});
const canvas = new CanvasManager(frame, renderer.domElement, renderer, HandleResize);
const camera = new THREE.PerspectiveCamera(75, canvas.Aspect(), 0.1, 1000);
const flatScene = new THREE.Scene()
const flatCamera = new THREE.PerspectiveCamera(75, canvas.Aspect(), 0.1, 1000);
let currentScale = 0.1

renderer.setSize(canvas.w, canvas.h);
renderer.setClearColor(0x444444, 1.0);

camera.position.z = 5;
flatCamera.position.z = 5
var Resize=() => {
    console.log(canvas.w, canvas.h)
    // camera.aspect = canvas.Aspect()
    // camera.updateMatrix()
}
const control = new TrackballControls(camera, frame)
// const fpControl = new KeyControls(camera, frame)
control.target.set(0, 0, 0)
control.rotateSpeed = 8.0;
control.noPan = false
control.maxDistance = 60
control.keys = []
const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );
var light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 10, 10, 10 );
scene.add( light );

var plight = new THREE.PointLight( 0xffffff, 1, 200 );
plight.position.set( -40, 20, 20 );
scene.add( plight );

var light1 = new THREE.PointLight( 0xffffff, 1, 200 );
light1.position.set( -40, -20, -20 );
scene.add( light1 );

var light2 = new THREE.PointLight( 0xffffff, 1, 200 );
light2.position.set( -20, 10, -10 );
scene.add( light2 );

let ctrlPoints = new Array<Array<Array<THREE.Vector3>>>()
let objectScene : THREE.Scene | THREE.Object3D | null = null
let ctrlPointsGroup = new Group()
let STUs = new Array<STU>()
let dimensions = new THREE.Vector3(2, 2, 2)
// let bounding = new Box3()

scene.add(ctrlPointsGroup)

function render(tm : number) {
    requestAnimationFrame(render);
    renderer.autoClear = true;
    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.render(flatScene, flatCamera)
    // fpControl.update(tm - lastTm)
    control.update();
}
render(0);

const axies = new THREE.Group()
scene.add(axies)

const MakeOne = (x: number, y: number, z: number, color: number, name ?: string)=>{
    const group = new THREE.Group();
    var geometry = new THREE.CylinderGeometry( 0.015, 0.015, x||y||z, 3 );
    var material = new THREE.MeshBasicMaterial( {color: color} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(x/2,y/2,z/2)
    
    const matCone = new THREE.ConeGeometry( 0.05, 0.1, 6 );
    
    const geoCone = new THREE.MeshBasicMaterial( {color: color} );
    cylinder.userData = { name: name, color:color, axis: new THREE.Vector3(x, y, z) }

    const cone = new THREE.Mesh( matCone, geoCone );
    cone.position.set(x, y, z)
    const n = cone.position.clone().normalize()
    cone.rotation.set(n.z * Math.PI / 2, n.y * Math.PI / 2, -n.x * Math.PI / 2)
    cone.userData = { name: name, color:color, axis: new THREE.Vector3(x, y, z) }
    cylinder.rotation.set(n.z * Math.PI / 2, n.y * Math.PI / 2, -n.x * Math.PI / 2)
    
    group.userData = { name: name, color:color, axis: new THREE.Vector3(x, y, z) }
    group.add(cylinder, cone)
    return group;
}

const axisLength = 0.6 as const

{
    const group = MakeOne(axisLength, 0, 0, 0xffff00, 'x')
    axies.add(group)
}
{
    const group = MakeOne(0, axisLength, 0, 0xff00ff, 'y')
    axies.add(group)
}
{
    const group = MakeOne(0, 0, axisLength, 0x00aaff, 'z')
    axies.add(group)
}

const orthoAxis = new THREE.Group()

flatScene.add(orthoAxis)
{
    const group = MakeOne(1, 0, 0, 0xffff00)
    orthoAxis.add(group)
}
{
    const group = MakeOne(0, 1, 0, 0xff00ff)
    orthoAxis.add(group)
}
{
    const group = MakeOne(0, 0, 0.5, 0x00aaff)
    orthoAxis.add(group)
}
orthoAxis.position.set(-6 * canvas.Aspect(), -6 , -4.6)

const axisCaster = new THREE.Raycaster()
let lastAxis : THREE.Group | null = null
axisCaster.linePrecision = 0.05;
let mousedown = false
let lastMouse = {
    x: 0,
    y: 0,
    update: (what:{x:number,y:number}) => {
        let delta = new THREE.Vector3(
            what.x - lastMouse.x,
            what.y - lastMouse.y
        )
        lastMouse.x = what.x
        lastMouse.y = what.y
        return delta;
    },
    clone: () => {
        return {
            x: lastMouse.x,
            y: lastMouse.y
        }
    }
}

const setAxisColor = (color:number) => {
    if(!lastAxis) return;
    ((lastAxis.children[0] as Mesh).material as MeshBasicMaterial).color.set( color );
    ((lastAxis.children[1] as Mesh).material as MeshBasicMaterial).color.set( color );
}

frame.onmousedown = (ev)=>{
    mousedown = true
    canvas.setPickPosition(ev)
    lastMouse.update(canvas.pickPosition)
    axisCaster.setFromCamera(canvas.pickPosition, camera);
    const hits = axisCaster.intersectObjects(axies.children, true)
    if(lastAxis !== null) {
        setAxisColor( lastAxis.userData.color );
        lastAxis = null
    }
    if(hits.length) {
        control.enabled = false;
        lastAxis = hits[0].object.parent as Group;
        setAxisColor( 0xffffff );
    }
}

let lastCtrlPoints = new Set<Mesh>()

const clearSelected = ()=>{
    lastCtrlPoints.forEach(m=>{
        const mat = (m.material as THREE.MeshLambertMaterial);
        // mat.emissive = new THREE.Color(0xbbbbbb);
        mat.color = new Color(0x999999)
        mat.reflectivity = 1
    });
    lastCtrlPoints.clear()
}


frame.onclick = (ev)=>{
    canvas.setPickPosition(ev)
    axisCaster.setFromCamera(canvas.pickPosition, camera);
    const hits = axisCaster.intersectObjects(ctrlPointsGroup.children)
    
    if(hits.length) {
        if(!ev.ctrlKey) {
            clearSelected()   
        }
        lastCtrlPoints.add(hits[0].object as Mesh);
        const mat  = (hits[0].object as THREE.Mesh).material as THREE.MeshLambertMaterial;
        // mat.emissive = new THREE.Color(0x99ffee);
        mat.color = new Color(0xbb44ff)
        mat.reflectivity = 1.4
        const pos = hits[0].object.position
        axies.position.set(pos.x, pos.y, pos.z)
    }
}

const moveRaycaster = new THREE.Raycaster();

frame.onmousemove = (ev)=>{
    if(lastAxis === null || !mousedown || !lastCtrlPoints.size) return
    canvas.setPickPosition(ev)
    const delta = lastMouse.update(canvas.pickPosition)
    if(delta.length() === 0) return;
    const axis = lastAxis.userData.axis as THREE.Vector3
    const axis_proj = axis.clone().project(camera);
    //const axis_proj2d = axis_proj.clone();
    axis_proj.z = 0

    moveRaycaster.setFromCamera(canvas.pickPosition, camera);

    const raw_move = axis_proj.dot(delta) / axis_proj.length();
    //const dst = axis_proj2d.multiplyScalar(raw_move).add(axis_proj);

    ///axis_proj.x += axis_proj2d.x
    //axis_proj.y += axis_proj2d.y
    //const dst = axis_proj.unproject(camera);
    //axies.position.set(dst.x, dst.y, dst.z);

    const move = raw_move * (axisLength / axis_proj.length()) * 0.76;
    const dst = axis.clone().multiplyScalar(move); // move direction vector
    
    // dst.add(axies.position)
    
    axies.position.add(dst);

    lastCtrlPoints.forEach(m=>{
        m.position.add(dst)
        const fi = m.position;
        const xyz = m.userData.xyz
        ctrlPoints[xyz[0]][xyz[1]][xyz[2]].set(fi.x, fi.y, fi.z);
    })
    ffd();
}

frame.onmouseup = (ev)=>{
    mousedown = false
    control.enabled = true
    if(lastAxis !== null) {
        setAxisColor( lastAxis.userData.color )
        
        lastAxis = null
    }
}

function MakeCtrlPoint(dims : THREE.Vector3, box : THREE.Box3, fn: (v:THREE.Vector3, xyz: number[])=>any) {
    const gap = box.max.clone().sub(box.min)
    const arr = new Array<Array<Array<THREE.Vector3>>>()
    
    for(let i = 0; i < dims.x + 1; ++i) {
        arr[i] = new Array<Array<THREE.Vector3>>()
        for(let j = 0; j < dims.y + 1; ++j) {
            arr[i][j] = new Array<THREE.Vector3>()
            for(let k = 0; k < dims.z + 1; ++k) {
                arr[i][j][k] = new THREE.Vector3(
                    gap.x / dims.x * i,
                    gap.y / dims.y * j,
                    gap.z / dims.z * k,
                )
                arr[i][j][k].add(box.min)
                fn(arr[i][j][k], [i, j, k])
            }
        }
    }
    return arr
}


// children[0]: lines
// children[1]: plane
const lattices = new THREE.Group();

function UpdateCtrlPoints(dims : THREE.Vector3) {
    if(objectScene === null) {
        return
    }

    dimensions = dims
    while (ctrlPointsGroup.children.length)
    {
        ctrlPointsGroup.remove(ctrlPointsGroup.children[0]);
    }

    let box = new Box3().setFromObject(objectScene);
    console.log(box)
    // bounding = box
    const Check = (a : number, b : number)=>{
        return a === 0 || a === b
    }
    ctrlPoints = MakeCtrlPoint(dims, box, (v, xyz)=>{
        if(!(Check(xyz[0], dims.x) || Check(xyz[1], dims.y) || Check(xyz[2], dims.z))) return;
        let geometry = new THREE.SphereGeometry(0.042, 16, 16)
        let material = new THREE.MeshLambertMaterial({color:0xaaaaaa});
        let dot = new THREE.Mesh(geometry, material)
        dot.position.set(v.x, v.y, v.z)
        dot.userData = { xyz: xyz }
        ctrlPointsGroup.add(dot)
    })
}

function productRange(a:number, b:number) {
    let prd = a, i = a;
    while(i++ < b) {
        prd *= i
    }
    return prd
}

function C(n:number, k:number) {
    k = (k < n-k) ? n-k : k // this must go first
    if(n === k) return 1;
    return productRange(k+1, n) / productRange(1, n-k)
}

function ffdOnce(l:number, m:number, n:number, s:number, t:number, u:number, P:THREE.Vector3[][][] /*ctrl point*/) {
    const pow = Math.pow
    const X = new THREE.Vector3(0,0,0)
    for(let i = 0; i <= l; ++i) {
        for(let j = 0; j <= m; ++j) {
            for(let k = 0; k <= n; ++k) {
                const coeff = 
                    C(l,i)*pow(1-s,l-i)*pow(s,i)* // bernstein
                    C(m,j)*pow(1-t,m-j)*pow(t,j)*
                    C(n,k)*pow(1-u,n-k)*pow(u,k)
                X.add(P[i][j][k].clone().multiplyScalar(coeff))
            }
        }
    }
    X.multiplyScalar(1/currentScale)
    return X
}

function ffd() {
    for(let stu of STUs) {
        let v = stu.stu
        let buf = new Float32Array(v.length);
        let pos = (stu.object.geometry as BufferGeometry).attributes.position as BufferAttribute;
        
        for(let i = 0; i < v.length; i+=3){
            let r = ffdOnce(dimensions.x, dimensions.y, dimensions.z, v[i], v[i+1], v[i+2], ctrlPoints);
            buf[i]   = r.x
            buf[i+1] = r.y
            buf[i+2] = r.z
        }
        pos.set(buf)
        pos.needsUpdate = true
    }
}

let orginalBounding = new THREE.Box3()

function ComputeSTUOnce(v : ArrayLike<number>, box:Box3) {
    const res = new Float32Array(v.length)
    const gap = box.max.clone().sub(box.min)
    for(let i = 0; i < v.length;++i){
        res[i] = (v[i] - box.min.x) / gap.x
        ++i;
        res[i] = (v[i] - box.min.y) / gap.y
        ++i;
        res[i] = (v[i] - box.min.z) / gap.z
    }
    return res
}

function ComputeSTUOnceObj(object:Mesh) {
    STUs.push(
        {
            object: object,
            stu: ComputeSTUOnce(((object.geometry as BufferGeometry).attributes.position as BufferAttribute).array, orginalBounding)
        }
    )
}

const loader = new GLTFLoader()
let lastHepler: THREE.BoxHelper | null = null
const loadModel = (path:string, scale: number)=>{
    loader.load(path, (m)=>{
        if(objectScene) {
            scene.remove(objectScene);
        }
        currentScale = scale
        orginalBounding.setFromObject(m.scene)
        m.scene.scale.set(scale, scale, scale)
        scene.add(m.scene)
        objectScene = m.scene
        STUs = []
        
        m.scene.traverse(object=>{
            if(object instanceof Mesh) {
                if(object.geometry instanceof BufferGeometry) {
                    ComputeSTUOnceObj(object);
                }
            }
        })
        if(lastHepler) scene.remove(lastHepler)

        let helper = new THREE.BoxHelper(m.scene, new THREE.Color(0xaa3348));
        helper.update();
        scene.add(helper); 
        lastHepler = helper
        UpdateCtrlPoints(dimensions)
    })
}

const changeScene = (what:string)=>{
    if(what === 'book') {
        loadModel('./book/scene.gltf', 0.1)
    }
    else if(what === 'car') {
        loadModel('./car/scene.gltf', 0.003);
    }
    else {
        if(lastHepler) scene.remove(lastHepler)
        if(objectScene) scene.remove(objectScene);
        const material = new THREE.MeshPhysicalMaterial( {color: 0x2194ce, metalness: 0.5, roughness: 0.6 } );
        let geometry: THREE.BufferGeometry | null = null
        if(what === 'sphere') {
            geometry = new THREE.SphereBufferGeometry( 0.5, 64, 64 );
        }
        else if (what === 'cube') {
            geometry = new THREE.BoxBufferGeometry(1, 1, 1, 8, 8, 8);
        }
        else if(what === 'cylinder') {
            geometry = new THREE.CylinderBufferGeometry( 0.5, 0.5, 1, 32 );
        }
        else if(what === 'donut') {
            geometry = new THREE.TorusBufferGeometry( 0.5, 0.25, 16, 100 );
        }
        else {
            return;
        }
        const mesh = new THREE.Mesh( geometry, material );
        orginalBounding.setFromObject(mesh);
        objectScene = mesh
        UpdateCtrlPoints(dimensions)
        STUs=[]
        ComputeSTUOnceObj(mesh)
        currentScale = 1
        scene.add( mesh );
    }
    
}

changeScene('book')
return {
    updateCtrlDims: (x:number, y:number, z:number)=> UpdateCtrlPoints(new THREE.Vector3(x, y, z)),
    updateScene: (x:string)=>changeScene(x),
    reset: ()=>{ UpdateCtrlPoints(dimensions); ffd(); }
}

}