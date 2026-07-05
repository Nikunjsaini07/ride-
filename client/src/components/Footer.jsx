import { Bike } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col">
          <div className="footer-brand">
            <img
              src="/sug-logo.png"
              alt="Shobhit University, Gangoh"
              className="footer-logo"
            />
          </div>
          <p className="footer-tagline">
            SUG RideShare — a student bike ride-sharing platform for Shobhit
            University, Gangoh. Share rides, save fuel, travel together.
            <span style={{ display: 'block', marginTop: '8px', color: 'var(--primary)', fontWeight: '600' }}>
              <Bike size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Free student network
            </span>
          </p>
        </div>

        <div className="footer-col">
          <h4>University</h4>
          <ul>
            <li>
              <a href="https://sug.ac.in/" target="_blank" rel="noreferrer">
                sug.ac.in
              </a>
            </li>
            <li>
              <a
                href="https://sug.ac.in/admission"
                target="_blank"
                rel="noreferrer"
              >
                Admissions
              </a>
            </li>
            <li>
              <a
                href="https://sug.ac.in/contact-us"
                target="_blank"
                rel="noreferrer"
              >
                Contact University
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Campus</h4>
          <p className="footer-addr">
            Shobhit University, Gangoh
            <br />
            Saharanpur, Uttar Pradesh
            <br />
            India
          </p>
          <p className="footer-naac">Accredited with NAAC Grade A</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {year} SUG RideShare · For Shobhit University students
        </span>
        <span className="footer-dev">
          Developed by <strong>Nikunj Saini</strong>
        </span>
      </div>
    </footer>
  );
}
