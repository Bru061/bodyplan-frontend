import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

function MainLayout({children}){
  return(
    <>
      <PublicNavbar/>
      {children}
      <Footer/>
    </>
  )
}

export default MainLayout;