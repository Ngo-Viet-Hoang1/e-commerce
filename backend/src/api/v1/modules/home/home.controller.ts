import type { Request, Response } from 'express'

class HomeController {
  index(req: Request, res: Response) {
    res.json({ message: 'Hello World!' })
  }
}

export const homeController = new HomeController()
export default HomeController
