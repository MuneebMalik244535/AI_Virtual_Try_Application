import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { QuestionFlow } from "./pages/question-flow";
import { ImageUpload } from "./pages/image-upload";
import { Processing } from "./pages/processing";
import { Recommendations } from "./pages/recommendations";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/questions",
    element: <QuestionFlow />,
  },
  {
    path: "/upload",
    element: <ImageUpload />,
  },
  {
    path: "/processing",
    element: <Processing />,
  },
  {
    path: "/recommendations",
    element: <Recommendations />,
  },
]);
