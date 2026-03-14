import NavbarGym from "../components/NavbarGym";

function OnboardingLayout({ children }) {
  return (
    <>
      <NavbarGym />
      <div className="main-content">
        {children}
      </div>
    </>
  );
}

export default OnboardingLayout;