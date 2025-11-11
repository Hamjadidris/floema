import Page from "classes/Page";

export default class About extends Page {
  constructor() {
    super({
      id: "About",
      element: ".about",
      elements: { wrapper: ".about__wrapper" },
    });
  }
}
