import Page from "classes/page";

export default class Home extends Page {
  constructor() {
    super({
      id: "Home",
      element: ".home",
      elements: {
        navigation: document.querySelector(".navigation"),
        link: ".home__link",
      },
    });
  }

  create() {
    super.create();
  }
}
