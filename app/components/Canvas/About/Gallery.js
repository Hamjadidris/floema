import { Geometry, Plane, Transform } from "ogl";

import GSAP from "gsap";

import Media from "./Media";

import map from "lodash/map";

export default class Gallery {
  constructor({ index, element, gl, geometry, scene, sizes }) {
    this.index = index;
    this.element = element;
    this.elementsWrapper = element.querySelector(".about__gallery__wrapper");

    this.gl = gl;
    this.geometry = geometry;
    this.scene = scene;
    this.sizes = sizes;

    this.scroll = {
      current: 0,
      target: 0,
      start: 0,
      lerp: 0.1,
      velocity: 1,
    };

    this.group = new Transform();

    this.createMedias();

    this.group.setParent(this.scene);
  }

  createMedias() {
    this.mediaElements = this.element.querySelectorAll(
      ".about__gallery__media"
    );

    this.medias = map(this.mediaElements, (element, index) => {
      return new Media({
        index,
        element,
        gl: this.gl,
        sizes: this.sizes,
        scene: this.group,
        geometry: this.geometry,
      });
    });
  }

  // Animations
  show() {
    map(this.medias, (media) => media.show());
  }

  hide() {
    map(this.medias, (media) => media.hide());
  }

  onResize(event) {
    this.bounds = this.elementsWrapper.getBoundingClientRect();

    this.sizes = event.sizes;

    this.width = (this.bounds.width / window.innerWidth) * this.sizes.width;
    this.height =(this.bounds.height / window.innerHeight) * this.sizes.height // prettier-ignore

    this.scroll.current = this.scroll.target = 0;

    map(this.medias, (media) => media.onResize(event, this.scroll.current));
  }

  onTouchDown({ x, y }) {
    this.scroll.start = this.scroll.current;
  }

  onTouchMove({ x, y }) {
    const distance = x.start - x.end;

    this.scroll.target = this.scroll.start - distance;
  }

  onTouchUp({ x, y }) {}

  update(scroll) {
    if (!this.bounds) return;

    const distance = (scroll.current - scroll.target) * 0.1;
    const y = scroll.current / window.innerHeight;

    if (this.scroll.target > this.scroll.current) {
      this.direction = "left";
      this.scroll.velocity = 1;
    } else if (this.scroll.target < this.scroll.current) {
      this.direction = "right";
      this.scroll.velocity = -1;
    }

    this.scroll.target -= this.scroll.velocity;
    this.scroll.target += distance;

    this.scroll.current = GSAP.utils.interpolate( this.scroll.current, this.scroll.target, this.scroll.lerp ); // prettier-ignore

    map(this.medias, (media, index) => {
      const scaleX = media.mesh.scale.x / 2 + 0.25;

      if (this.direction === "left") {
        const x = media.mesh.position.x + scaleX;

        if (x < -this.sizes.width / 2) {
          media.extra += this.width;
        }
      } else if (this.direction === "right") {
        const x = media.mesh.position.x - scaleX;

        if (x > this.sizes.width / 2) {
          media.extra -= this.width;
        }
      }

      media.update(this.scroll.current);
    });

    this.group.position.y = y * this.sizes.height;
  }

  destroy() {
    this.scene.removeChild(this.group);
  }
}
