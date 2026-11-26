import Loader from "../components/Loader";
import Ticker from "../components/Ticker";
import Nav from "../components/Nav";
import Hero from "../components/Hero";
import Discover from "../components/Discover";
import { Places, Gems } from "../components/Places";
import MapView from "../components/MapView";
import Moments from "../components/Moments";
import Food from "../components/Food";
import Stay from "../components/Stay";
import Planner from "../components/Planner";
import Guide from "../components/Guide";
import { When, Festivals, Traditions } from "../components/When";
import Gallery from "../components/Gallery";
import Stories from "../components/Stories";
import { Practical } from "../components/Practical";
import { Footer } from "../components/Footer";
export default function Page() {
  return (<><Loader /><Nav /><main><Hero /><Discover /><Ticker words={["Malpe", "Kaup", "Manipal", "Barkur", "Karkala", "Maravanthe", "Udyavara"]} /><Places /><Gems /><MapView /><Moments /><Ticker dir={-1} words={["Pathrode", "Kori rotti", "Hayagreeva", "Moode", "Appe midi", "Punarpuli", "Kane fry"]} /><Food /><Stay /><Planner /><Guide /><When /><Festivals /><Traditions /><Gallery /><Stories /><Practical /></main><Footer /></>);
}
