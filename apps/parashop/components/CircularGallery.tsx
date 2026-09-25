
import React, { useEffect, useRef } from 'react';
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';

// --- UTILS ---
function debounce(func: Function, wait: number) {
  let timeout: any;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

// --- CLASSES WebGL ---

// High resolution text texture creator
function createTextTexture(gl: any, text: string, font = 'bold 40px sans-serif', color = 'black') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return { texture: new Texture(gl), width: 0, height: 0 };

  // Scale for high DPI
  const dpr = 2; // Force high resolution for text
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(parseInt(font, 10) * 1.5);
  
  canvas.width = (textWidth + 40) * dpr;
  canvas.height = (textHeight + 40) * dpr;
  
  context.scale(dpr, dpr);
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, (textWidth + 40) / 2, (textHeight + 40) / 2);
  
  const texture = new Texture(gl, { generateMipmaps: true }); // Mipmaps help with scaling quality
  texture.image = canvas;
  return { texture, width: canvas.width / dpr, height: canvas.height / dpr };
}

class Title {
  gl: any;
  plane: any;
  renderer: any;
  text: string;
  textColor: string;
  font: string;
  mesh: any;

  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }: any) {
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.2; // Adjusted size relative to plane
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.1;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  geometry: any;
  gl: any;
  image: string;
  index: number;
  length: number;
  renderer: any;
  scene: any;
  screen: any;
  text: string;
  viewport: any;
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
  imageFit: 'cover' | 'contain';
  circular: boolean;
  itemSize: number;
  program: any;
  plane: any;
  title: any;
  extra: number = 0;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  widthTotal: number = 0;
  scale: number = 0;
  padding: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;
  speed: number = 0;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    imageFit = 'cover',
    circular = false,
    itemSize = 700
  }: any) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.imageFit = imageFit;
    this.circular = circular;
    this.itemSize = itemSize;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true,
      minFilter: this.gl.LINEAR_MIPMAP_LINEAR, // Important for sharpness
      magFilter: this.gl.LINEAR
    });
    
    // Convert flags for shader
    const isContain = this.imageFit === 'contain' ? 1.0 : 0.0;
    const isCircular = this.circular ? 1.0 : 0.0;

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          // Simple subtle breathing effect, less distortion for clarity
          p.z = (sin(p.x * 2.0 + uTime) * 0.5 + cos(p.y * 1.0 + uTime) * 0.5) * (0.05 + uSpeed * 0.2);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        uniform float uImageFit; // 1.0 for contain, 0.0 for cover
        uniform float uCircular; // 1.0 for circle
        varying vec2 vUv;
        
        // Signed Distance Field for Rounded Box
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(1.0);
          vec2 uv = vUv;

          if (uImageFit > 0.5) {
             // CONTAIN MODE
             // Inverse ratio logic: we calculate scale to fit image INSIDE plane
             float planeAspect = uPlaneSizes.x / uPlaneSizes.y;
             float imageAspect = uImageSizes.x / uImageSizes.y;
             
             vec2 scale = vec2(1.0);
             
             if (imageAspect > planeAspect) {
                // Image is wider than plane, fit to width
                scale = vec2(1.0, planeAspect / imageAspect);
             } else {
                // Image is taller than plane, fit to height
                scale = vec2(imageAspect / planeAspect, 1.0);
             }
             
             // Map UVs: Center the image
             uv = (vUv - 0.5) / scale + 0.5;

             // --- FIX: REMOVED AGGRESSIVE ZOOM OUT ---
             // We removed the uCircular zoom out logic here to keep logos large.
             // If clipping occurs on corners of square logos, we can adjust padding in the image itself.

          } else {
             // COVER MODE (Default)
             ratio = vec2(
                min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
                min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
             );
             uv = vec2(
                vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
                vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
             );
          }

          vec4 color = texture2D(tMap, uv);
          
          // FOR CONTAIN MODE: Handle empty space & Transparent PNGs
          if (uImageFit > 0.5) {
             // If UV is out of [0,1] bounds (empty space padding)
             if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                color = vec4(1.0, 1.0, 1.0, 1.0); // Fill padding with White
             } else {
                // Blend texture with white background (for transparency)
                vec3 bg = vec3(1.0, 1.0, 1.0);
                color = vec4(mix(bg, color.rgb, color.a), 1.0);
             }
          }

          // SHAPE LOGIC
          float d = 0.0;
          if (uCircular > 0.5) {
             // Circle SDF
             // vUv is 0..1, centered at 0.5. Radius is 0.5
             d = length(vUv - 0.5) - 0.5;
          } else {
             // Rounded Box Logic
             vec2 aspect = vec2(uPlaneSizes.x / uPlaneSizes.y, 1.0);
             vec2 centeredUv = (vUv - 0.5) * aspect;
             vec2 boxSize = vec2(0.5 * aspect.x, 0.5) - uBorderRadius;
             d = roundedBoxSDF(centeredUv, boxSize, uBorderRadius);
          }
          
          // High quality Anti-aliasing
          float alpha = 1.0 - smoothstep(-0.005, 0.005, d);
          
          gl_FragColor = vec4(color.rgb, color.a * alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
        uImageFit: { value: isContain },
        uCircular: { value: isCircular }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }

  update(scroll: any, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = false;
      this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = false;
      this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    
    this.scale = this.screen.height / 1500;
    
    // User configurable item size (previously hardcoded 700)
    // For smaller cards, itemSize should be around 300-400
    this.plane.scale.y = (this.viewport.height * (this.itemSize * this.scale)) / this.screen.height;
    
    // Maintain square aspect for logos/circles
    this.plane.scale.x = this.plane.scale.y; 

    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    
    // Spacing
    this.padding = this.plane.scale.x * 0.2; 
    
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class WebGLApp {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: { ease: number; current: number; target: number; last: number; position?: number };
  onCheckDebounce: Function;
  renderer: any;
  gl: any;
  camera: any;
  scene: any;
  planeGeometry: any;
  mediasImages: any[];
  medias: Media[];
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  raf: any;
  isDown: boolean;
  start: number;
  boundOnResize: any;
  boundOnWheel: any;
  boundOnTouchDown: any;
  boundOnTouchMove: any;
  boundOnTouchUp: any;

  constructor(
    container: HTMLElement,
    {
      items,
      bend,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px sans-serif',
      scrollSpeed = 2,
      scrollEase = 0.05,
      imageFit = 'cover',
      circular = false,
      itemSize = 700
    }: any = {}
  ) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font, imageFit, circular, itemSize);
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2) // Sharpness handling
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 50
    });
  }

  createMedias(items: any[], bend: number, textColor: string, borderRadius: number, font: string, imageFit: string, circular: boolean, itemSize: number) {
    // Duplicate items to ensure smooth infinite loop if count is low
    const galleryItems = items && items.length ? items : [];
    // Ensure we have enough items for the loop logic (at least 12-15 for this logic)
    let fillItems = [...galleryItems];
    while(fillItems.length < 12) {
        fillItems = [...fillItems, ...galleryItems];
    }
    
    this.mediasImages = fillItems;
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        imageFit,
        circular,
        itemSize
      });
    });
  }

  onTouchDown(e: any) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: any) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = (this.scroll.position || 0) + distance;
  }

  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }

  onWheel(e: any) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.5;
    this.onCheckDebounce();
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    if (this.scroll.target < 0) {
      this.scroll.target = -item;
    } else {
      this.scroll.target = item;
    }
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    this.container.addEventListener('mousewheel', this.boundOnWheel);
    this.container.addEventListener('wheel', this.boundOnWheel);
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    this.container.addEventListener('touchstart', this.boundOnTouchDown);
    window.addEventListener('touchmove', this.boundOnTouchMove);
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    this.container.removeEventListener('mousewheel', this.boundOnWheel);
    this.container.removeEventListener('wheel', this.boundOnWheel);
    this.container.removeEventListener('mousedown', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    this.container.removeEventListener('touchstart', this.boundOnTouchDown);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

interface CircularGalleryProps {
  items: { image: string; text: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  imageFit?: 'cover' | 'contain';
  circular?: boolean;
  itemSize?: number;
}

export default function CircularGallery({
  items,
  bend = 2,
  textColor = '#1f2937',
  borderRadius = 0.05,
  font = 'bold 30px "Playfair Display", serif',
  scrollSpeed = 2,
  scrollEase = 0.05,
  imageFit = 'cover',
  circular = false,
  itemSize = 700
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const app = new WebGLApp(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, imageFit, circular, itemSize });
    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, imageFit, circular, itemSize]);

  return <div className="circular-gallery w-full h-full cursor-grab active:cursor-grabbing overflow-hidden" ref={containerRef} />;
}
