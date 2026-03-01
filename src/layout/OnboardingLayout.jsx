import NavbarGym from '../components/NavbarGym'
import Footer from '../components/Footer'

function OnboardingLayout({ children }) {
    return (
        <>
            <NavbarGym />
            <div className="main-content">
                {children}
            </div>
            <Footer />
        </>
    )
}

export default OnboardingLayout