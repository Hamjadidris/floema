import { Geometry, Plane, Transform } from "ogl";
import GSAP from "gsap";

import Gallery from "./Gallery";

import map from "lodash/map";

export default class About {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;
    this.createScene();

    this.createGeometry();
    this.createGalleries();

    this.group.setParent(scene);

    this.x = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };

    this.y = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };

    this.scrollCurrent = {
      x: 0,
      y: 0,
    };

    this.scroll = {
      x: 0,
      y: 0,
    };

    this.show();
  }

  createScene() {
    this.group = new Transform();
  }

  createGeometry() {
    this.geometry = new Plane(this.gl);
  }

  createGalleries() {
    this.galleriesElement = document.querySelectorAll(".about__gallery");

    this.galleries = map(this.galleriesElement, (element, index) => {
      return new Gallery({
        index,
        element,
        gl: this.gl,
        scene: this.group,
        geometry: this.geometry,
        sizes: this.sizes,
      });
    });
  }

  // Animations
  show() {
    map(this.galleries, (gallery) => gallery.show());
  }

  hide() {
    map(this.galleries, (gallery) => gallery.hide());
  }

  onTouchDown(event) {
    map(this.galleries, (gallery) => gallery.onTouchDown(event));
  }

  onTouchMove(event) {
    map(this.galleries, (gallery) => gallery.onTouchMove(event));
  }

  onTouchUp(event) {
    map(this.galleries, (gallery) => gallery.onTouchUp(event));
  }

  onResize(event) {
    map(this.galleries, (gallery) => gallery.onResize(event));
  }

  onWheel({ pixelX, pixelY }) {
    this.x.target += pixelX;
    this.y.target += pixelY;
  }

  update(scroll) {
    map(this.galleries, (gallery) => gallery.update(scroll));
  }

  destroy() {
    map(this.galleries, (gallery) => gallery.destroy());
  }
}
