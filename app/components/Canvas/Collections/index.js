import { Geometry, Plane, Transform } from "ogl";
import GSAP from "gsap";

import Prefix from "prefix";

import Media from "./Media";

import map from "lodash/map";

export default class Collections {
  constructor({ gl, scene, sizes, transition }) {
    this.id = "collections";

    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;
    this.transition = transition;

    this.transformPrefix = Prefix("transform");

    this.createScene();

    this.galleryElement = document.querySelector( '.collections__gallery' ); // prettier-ignore
    this.galleryWrapperElement = document.querySelector( '.collections__gallery__wrapper' ); // prettier-ignore

    this.mediaElements = document.querySelectorAll( '.collections__gallery__media' ); // prettier-ignore
    this.titlesElement = document.querySelector(".collections__titles");
    this.collectionsElements = document.querySelectorAll('.collections__article'); // prettier-ignore
    this.collectionsElementsActive = "collections__article--active";

    this.scroll = {
      current: 0,
      target: 0,
      start: 0,
      lerp: 0.1,
      velocity: 1,
    };

    this.createGeometry();
    this.createGallery();

    this.onResize({
      sizes: this.sizes,
    });

    this.group.setParent(this.scene);

    this.show();
  }

  createScene() {
    this.group = new Transform();
  }

  createGeometry() {
    this.geometry = new Plane(this.gl);
  }

  createGallery() {
    this.medias = map(this.mediaElements, (element, index) => {
      return new Media({
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
  async show() {
    if (this.transition) {
      const { src } = this.transition.mesh.program.uniforms.tMap.value.image;
      const texture = window.TEXTURES[src];
      const media = this.medias.find((media) => media.texture === texture);

      GSAP.delayedCall(1, (_) => {
        this.scroll.current =
          this.scroll.target =
          this.scroll.last =
          this.scroll.start =
            -media.mesh.position.x;

        console.log(media.mesh.position.x, this.scroll.current);
      });

      this.transition.animate(this.medias[0].mesh, (_) => {});
    }

    map(this.medias, (media) => media.show());
  }

  hide() {
    map(this.medias, (media) => media.hide());
  }

  onTouchDown({ x, y }) {
    this.scroll.last = this.scroll.current;
  }

  onTouchMove({ x, y }) {
    const distance = x.start - x.end;

    this.scroll.target = this.scroll.last - distance;
  }

  onTouchUp({ x, y }) {}

  onResize(event) {
    this.sizes = event.sizes;

    this.bounds = this.galleryWrapperElement.getBoundingClientRect();

    this.scroll.last = this.scroll.target = 0;

    map(this.medias, (media) => media.onResize(event, this.scroll));

    this.scroll.limit = this.bounds.width - this.medias[0].element.clientWidth;
  }

  onWheel({ pixelX, pixelY }) {
    this.scroll.target += pixelY;
  }

  onChange(index) {
    this.index = index;
    const selectedCollection = parseInt(this.mediaElements[this.index]?.getAttribute('data-index')); // prettier-ignore

    map(this.collectionsElements, (element, elementIndex) => {
      if (elementIndex === selectedCollection) {
        element.classList.add(this.collectionsElementsActive);
      } else {
        element.classList.remove(this.collectionsElementsActive);
      }
    });

    this.titlesElement.style[this.transformPrefix] = `translateY(-${25 * selectedCollection}%) translate(-50%, -50%) rotate(-90deg)`; // prettier-ignore
  }

  update() {
    this.scroll.target = GSAP.utils.clamp(
      -this.scroll.limit,
      0,
      this.scroll.target,
    );

    this.scroll.current = GSAP.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      this.scroll.lerp,
    );

    this.galleryElement.style[this.transformPrefix] =
      `translateX(${this.scroll.current}px)`;

    if (this.scroll.last > this.scroll.current) {
      this.scroll.direction = "left";
    } else if (this.scroll.last < this.scroll.current) {
      this.scroll.direction = "right";
    }

    this.scroll.last = this.scroll.current;

    map(this.medias, (media, index) => {
      media.update(this.scroll.current);
    });

    const index = Math.floor(Math.abs(this.scroll.current / this.scroll.limit) * this.medias.length) // prettier-ignore
    if (this.index !== index) {
      this.onChange(index);
    }
  }

  destroy() {
    this.scene.removeChild(this.group);
  }
}
