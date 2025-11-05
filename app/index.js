import Home from "pages/Home";
import About from "pages/About";
import Detail from "pages/Detail";
import Collections from "pages/Collections";

import each from "lodash/each";

class App {
  constructor() {
    this.createContent();
    this.createPages();
    this.addLinkListeners();
  }

  createContent() {
    this.content = document.querySelector(".content");
    this.template = this.content.getAttribute("data-template");
  }

  createPages() {
    this.pages = {
      home: new Home(),
      about: new About(),
      detail: new Detail(),
      collections: new Collections(),
    };

    this.page = this.pages[this.template];
    this.page.create();
  }

  async onChange(url) {
    await this.page.hide();

    const res = await window.fetch(url);
    if (res.status === 200) {
      const html = await res.text();

      const div = document.createElement("div");
      div.innerHTML = html;

      const divContent = div.querySelector(".content");
      this.content.innerHTML = divContent.innerHTML;

      this.template = divContent.getAttribute("data-template");
      this.content.setAttribute("data-template", this.template);

      this.page = this.pages[this.template];
      this.page.create();
      this.page.show();
    } else {
      console.error(`response status: ${res.status}`);
    }
  }

  addLinkListeners() {
    const links = document.querySelectorAll("a");

    each(links, (link) => {
      link.onclick = (event) => {
        event.preventDefault();

        const { href } = link;

        this.onChange(href);
      };
    });
  }
}

new App();
