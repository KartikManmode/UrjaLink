import { useState, useEffect } from 'react';
import './App.css';
import heroChargerImg from './assets/hero_charger.jpeg';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('dc');
  const [suitabilityStep, setSuitabilityStep] = useState(1);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Form States
  const [suitabilityForm, setSuitabilityForm] = useState({
    propertyType: 'highway',
    space: 1000,
    powerLoad: 60,
    traffic: 'medium',
    ownership: 'owned'
  });

  const [suitabilityResult, setSuitabilityResult] = useState(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    message: ''
  });

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Products Database
  const acProducts = [
    {
      id: 'ac-3.4',
      title: 'AC Home / Light Commercial',
      power: '3.4 kW',
      specs: {
        'Type': 'AC Single Phase',
        'Application': 'Home / Small Private Parking',
        'Ideal For': 'Residential Societies & Small Businesses',
        'Output Current': '16A Max',
        'Connectivity': 'Bluetooth / Wi-Fi Opt.'
      }
    },
    {
      id: 'ac-7.4',
      title: 'AC Home / Light Commercial Plus',
      power: '7.4 kW',
      specs: {
        'Type': 'AC Single Phase',
        'Application': 'Home / Office / Workplaces',
        'Ideal For': 'Private Charging & Fleets',
        'Output Current': '32A Max',
        'Connectivity': 'RFID + Mobile App'
      }
    },
    {
      id: 'ac-11',
      title: 'AC Commercial Charger',
      power: '11 kW',
      specs: {
        'Type': 'AC 3-Phase',
        'Application': 'Commercial Parking',
        'Ideal For': 'Hotels, Offices & Showrooms',
        'Output Current': '16A Max per Phase',
        'Connectivity': 'RFID + OCPP v1.6'
      }
    },
    {
      id: 'ac-22',
      title: 'AC Commercial High-Power',
      power: '22 kW',
      specs: {
        'Type': 'AC 3-Phase',
        'Application': 'Commercial Hubs',
        'Ideal For': 'Malls, Hotels & Parking lots',
        'Output Current': '32A Max per Phase',
        'Connectivity': 'RFID + OCPP v1.6 + 4G'
      }
    },
    {
      id: 'ac-30',
      title: 'AC Commercial Ultra-Power',
      power: '30 kW',
      specs: {
        'Type': 'AC 3-Phase Dual Gun',
        'Application': 'Heavy Duty Commercial',
        'Ideal For': 'Fleet Operators & Transit Hubs',
        'Output Current': 'Dual 32A Output',
        'Connectivity': 'RFID + OCPP v1.6 + Mobile App'
      }
    }
  ];

  const dcProducts = [
    {
      id: 'dc-30',
      title: '30 kW DC Fast Charger',
      power: '30 kW',
      specs: {
        'Connector': 'CCS2 Single/Dual',
        'Type': 'DC Fast Charger',
        'Output Voltage': '200 - 1000 Vdc',
        'Suitable For': 'Hotels, Small Commercial Hubs & Cafes',
        'Spec Sheet': 'URJA LINK BROCHURE.pdf'
      }
    },
    {
      id: 'dc-60',
      title: '60 kW DC Fast Charger',
      power: '60 kW',
      specs: {
        'Connector': 'CCS2 Dual Gun',
        'Type': 'DC Fast Charger',
        'Output Voltage': '200 - 1000 Vdc',
        'Suitable For': 'Highways, Transit Corridors & Public Stations',
        'Spec Sheet': 'TECHNICAL SPECS 60kw.pdf'
      }
    },
    {
      id: 'dc-90',
      title: '90 kW DC Fast Charger',
      power: '90 kW',
      specs: {
        'Connector': 'CCS2 Dual Gun',
        'Type': 'DC Fast Charger',
        'Output Voltage': '200 - 1000 Vdc',
        'Suitable For': 'Malls, Commercial Plots & Fleet Charging',
        'Spec Sheet': 'URJA LINK BROCHURE.pdf'
      }
    },
    {
      id: 'dc-120',
      title: '120 kW DC Fast Charger',
      power: '120 kW',
      specs: {
        'Connector': 'CCS2 Dual Gun',
        'Type': 'DC Fast Charger',
        'Output Voltage': '200 - 1000 Vdc',
        'Suitable For': 'Corridors, Fleet Hubs & Public Plazas',
        'Spec Sheet': 'TECHNICAL SPECS 120kw.pdf'
      }
    },
    {
      id: 'dc-180',
      title: '180 kW DC Fast Charger',
      power: '180 kW',
      specs: {
        'Connector': 'CCS2 Dual Gun',
        'Type': 'DC Fast Charger',
        'Output Voltage': '200 - 1000 Vdc',
        'Suitable For': 'High Speed Charging Hubs & Highway Depots',
        'Spec Sheet': 'URJA LINK BROCHURE.pdf'
      }
    },
    {
      id: 'dc-240',
      title: '240 kW - 480 kW Fast Charger',
      power: '240 - 480 kW',
      specs: {
        'Connector': 'CCS2 Dual/Multi Gun',
        'Type': 'High Capacity DC Charger',
        'Output Voltage': '200 - 1000 Vdc',
        'Suitable For': 'Bus/EV Hubs, Mining Sites & Heavy Fleet Depots',
        'Spec Sheet': 'URJA LINK BROCHURE.pdf'
      }
    }
  ];

  // Suitability checker logic
  const evaluateSuitability = () => {
    const { propertyType, space, powerLoad, traffic } = suitabilityForm;
    let score = 50; // base score
    let recommendation = '';
    let specSheet = 'URJA LINK BROCHURE.pdf';
    let powerTarget = '60 kW';

    // Type weight
    if (propertyType === 'highway') {
      score += 25;
      if (traffic === 'high') {
        recommendation = '120 kW DC Fast Charger';
        specSheet = 'TECHNICAL SPECS 120kw.pdf';
        powerTarget = '120 kW';
      } else {
        recommendation = '60 kW DC Fast Charger';
        specSheet = 'TECHNICAL SPECS 60kw.pdf';
        powerTarget = '60 kW';
      }
    } else if (propertyType === 'hotel' || propertyType === 'restaurant') {
      score += 20;
      if (space >= 1000) {
        recommendation = '60 kW DC Fast Charger';
        specSheet = 'TECHNICAL SPECS 60kw.pdf';
        powerTarget = '60 kW';
      } else {
        recommendation = '30 kW DC Fast Charger';
        specSheet = 'URJA LINK BROCHURE.pdf';
        powerTarget = '30 kW';
      }
    } else if (propertyType === 'mall') {
      score += 25;
      recommendation = '90 kW or 120 kW DC Fast Charger';
      specSheet = 'TECHNICAL SPECS 120kw.pdf';
      powerTarget = '120 kW';
    } else {
      score += 15;
      recommendation = '30 kW DC Fast Charger or 22 kW AC Charger';
      specSheet = 'URJA LINK BROCHURE.pdf';
      powerTarget = '30 kW';
    }

    // Space weight
    if (space >= 2000) score += 10;
    else if (space >= 1000) score += 5;
    else score -= 5;

    // Load weight
    if (powerLoad >= 120) score += 10;
    else if (powerLoad >= 60) score += 5;
    else score -= 10;

    // Traffic weight
    if (traffic === 'high') score += 10;
    else if (traffic === 'medium') score += 5;

    // Constrain score
    const finalScore = Math.min(Math.max(score, 30), 99);

    setSuitabilityResult({
      score: finalScore,
      recommendation,
      specSheet,
      powerTarget,
      summary: `Based on your ${propertyType.toUpperCase()} location with a space of ${space} sq ft, grid load of ${powerLoad} kW, and ${traffic} vehicle traffic, you have an excellent profile for starting an EV charging station.`
    });
    setSuitabilityStep(3);
  };

  const handleSuitabilityChange = (e) => {
    const { name, value } = e.target;
    setSuitabilityForm(prev => ({
      ...prev,
      [name]: name === 'space' || name === 'powerLoad' ? Number(value) : value
    }));
  };

  const handlePropertyTypeSelect = (type) => {
    setSuitabilityForm(prev => ({
      ...prev,
      propertyType: type
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', phone: '', location: '', message: '' });
    }, 1000);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container">
          <a href="#" className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <span>
              <span className="logo-text-blue">URJA</span>
              <span className="logo-text-green"> LINK</span>
            </span>
          </a>
          <ul className="nav-links">
            <li><a href="#benefits" className="nav-link">Benefits</a></li>
            <li><a href="#process" className="nav-link">Process</a></li>
            <li><a href="#catalog" className="nav-link">Products</a></li>
            <li><a href="#checker" className="nav-link">Suitability Check</a></li>
            <li><a href="#contact" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Get Started</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="container">
          <div className="grid-2">
            <div>
              <div className="hero-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>GLOBAL FAST-CHARGING EXCELLENCE</span>
              </div>
              <h1 className="hero-title">
                Turn Your Space Into An <span className="gradient-text-blue">EV Charging</span> <span className="gradient-text-green">Business</span>
              </h1>
              <p className="hero-desc">
                Partner with Urja Link to convert highways, hotels, malls, or roadside parking spots into highly profitable EV fast-charging hubs. We offer high-power universal DC fast chargers (30kW - 240kW) with end-to-end setup support.
              </p>
              <div className="hero-ctas">
                <a href="#checker" className="btn btn-primary">
                  Check Site Suitability
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
                <a href="/URJA LINK BROCHURE.pdf" target="_blank" className="btn btn-outline" rel="noreferrer">
                  Download Brochure
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              </div>
            </div>
            <div className="hero-image-wrapper">
              <div className="hero-image-glow"></div>
              <div className="hero-charger-card float-animation">
                <img src={heroChargerImg} alt="Urja Link EV Charger" className="hero-charger-img" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Specs */}
      <section className="quick-specs-section">
        <div className="container">
          <div className="spec-bar">
            <div className="spec-item">
              <div className="spec-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div className="spec-text">
                <h4>30kW - 240kW+</h4>
                <p>Flexible Power Output</p>
              </div>
            </div>
            <div className="spec-item">
              <div className="spec-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="spec-text">
                <h4>CCS2 Standard</h4>
                <p>Universal Compatibility</p>
              </div>
            </div>
            <div className="spec-item">
              <div className="spec-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
              </div>
              <div className="spec-text">
                <h4>Smart Grid</h4>
                <p>OCPP 1.6 Billing & Tech</p>
              </div>
            </div>
            <div className="spec-item">
              <div className="spec-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="spec-text">
                <h4>Certified Safe</h4>
                <p>ARAI & CE Certified IP55</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="section">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Opportunity</span>
            <h2 className="section-title">Why EV Charging is a Smart Investment</h2>
            <p className="section-subtitle">Convert your property into a high-demand service station and capture growing EV vehicle traffic.</p>
          </div>
          <div className="grid-3">
            <div className="benefit-card">
              <div className="benefit-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              </div>
              <h3>Use Empty Space Smartly</h3>
              <p>Convert underutilized parking lots, highway borders, or vacant commercial plots into active, high-yield assets.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>Attract EV Customers</h3>
              <p>EV owners actively scout for premium stations on Google Maps and charging apps during long-distance travels or commutes.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3>Additional Revenue streams</h3>
              <p>Profit from every single kilowatt-hour (kWh) dispensed, with smart cloud-based billing customized for your site.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <h3>Increase Footfall & Dwell Time</h3>
              <p>Drivers charge for 30-60 minutes, which leads to increased spending at nearby restaurants, hotels, showrooms, and shops.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/></svg>
              </div>
              <h3>Future-Ready Infrastructure</h3>
              <p>Build a tech-forward reputation, raise your commercial property value, and align with eco-friendly sustainability targets.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Safe & Scalable System</h3>
              <p>IP55 rated all-weather robust enclosures, full overcurrent protections, modular layout to grow as EV traffic scales up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Process Timeline */}
      <section id="process" className="section" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Partnership Flow</span>
            <h2 className="section-title">How We Build Together</h2>
            <p className="section-subtitle">From property survey to technical validation, Urja Link manages the setup complexities.</p>
          </div>
          <div className="process-grid">
            <div className="process-step">
              <div className="process-num">1</div>
              <h4>Enquiry & Check</h4>
              <p>You contact our project specialists and share your basic geographical boundaries, interest, and goals.</p>
            </div>
            <div className="process-step">
              <div className="process-num">2</div>
              <h4>Site Details Collection</h4>
              <p>We log your Google Map coordinates, structural parking spots, utility transformer capacity, and photos.</p>
            </div>
            <div className="process-step">
              <div className="process-num">3</div>
              <h4>Location Evaluation</h4>
              <p>Our engineers run traffic patterns, highway suitability reviews, and entry-exit accessibility analysis.</p>
            </div>
            <div className="process-step">
              <div className="process-num">4</div>
              <h4>Charger Selection</h4>
              <p>Based on electrical load limits and traffic, we recommend the optimal AC or DC fast charger specifications.</p>
            </div>
            <div className="process-step">
              <div className="process-num">5</div>
              <h4>Electrical Setup & Layout</h4>
              <p>We plan correct cable tray layouts, earthing connections, circuit breaker safeguards, and brand paneling.</p>
            </div>
            <div className="process-step">
              <div className="process-num">6</div>
              <h4>Commercial Launch</h4>
              <p>We configure the OCPP smart cloud platform, finalize user pricing rates, publish on app maps, and start charging.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog / Product Gallery */}
      <section id="catalog" className="section">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Our Hardware</span>
            <h2 className="section-title">High-Performance EV Chargers</h2>
            <p className="section-subtitle">Choose from our lineup of durable, smart AC and DC chargers designed for heavy public usage.</p>
          </div>

          <div className="catalog-tabs">
            <button className={`tab-btn ${activeTab === 'dc' ? 'active' : ''}`} onClick={() => setActiveTab('dc')}>
              DC Fast Chargers (30kW - 480kW)
            </button>
            <button className={`tab-btn ${activeTab === 'ac' ? 'active' : ''}`} onClick={() => setActiveTab('ac')}>
              AC Smart Chargers (3.4kW - 30kW)
            </button>
          </div>

          <div className="grid-3">
            {(activeTab === 'dc' ? dcProducts : acProducts).map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-img-container">
                  <div className="product-tag">{activeTab.toUpperCase()} Fast</div>
                  <img src={heroChargerImg} className="product-img-placeholder" alt={product.title} />
                </div>
                <div className="product-content">
                  <div className="product-header">
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-power">{product.power} Output</div>
                  </div>
                  <div className="product-specs-list">
                    {Object.entries(product.specs).map(([key, val]) => (
                      key !== 'Spec Sheet' && (
                        <div className="product-spec-row" key={key}>
                          <span className="spec-name">{key}</span>
                          <span className="spec-val">{val}</span>
                        </div>
                      )
                    ))}
                  </div>
                  {product.specs['Spec Sheet'] && (
                    <a href={`/${product.specs['Spec Sheet']}`} target="_blank" className="btn btn-outline" style={{ marginTop: 'auto' }} rel="noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Technical Specs PDF
                    </a>
                  )}
                  {!product.specs['Spec Sheet'] && (
                    <a href="/URJA LINK BROCHURE.pdf" target="_blank" className="btn btn-outline" style={{ marginTop: 'auto' }} rel="noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Brochure Details
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suitability Checker Section */}
      <section id="checker" className="section" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Interactive Evaluation</span>
            <h2 className="section-title">EV Site Suitability Calculator</h2>
            <p className="section-subtitle">Answer a few basic questions to evaluate your property potential and find the best charger recommendations.</p>
          </div>

          <div className="checker-wrapper">
            <div className="checker-header">
              <h3>Site Assessment Matrix</h3>
              <p>Step {suitabilityStep} of 3: {suitabilityStep === 1 ? 'Location & Space' : suitabilityStep === 2 ? 'Electricity & Utility Parameters' : 'Analysis Report'}</p>
            </div>
            <div className="checker-progress-bar">
              <div className="checker-progress-fill" style={{ width: `${(suitabilityStep / 3) * 100}%` }}></div>
            </div>

            <div className="checker-body">
              {/* Step 1 */}
              <div className={`checker-step ${suitabilityStep === 1 ? 'active' : ''}`}>
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <div className="property-types-grid">
                    {[
                      { key: 'highway', label: 'Highway Land', icon: '🛣️' },
                      { key: 'hotel', label: 'Hotel Parking', icon: '🏨' },
                      { key: 'restaurant', label: 'Restaurant', icon: '🍽️' },
                      { key: 'mall', label: 'Mall/Plaza', icon: '🛍️' }
                    ].map(opt => (
                      <div
                        key={opt.key}
                        className={`property-type-option ${suitabilityForm.propertyType === opt.key ? 'selected' : ''}`}
                        onClick={() => handlePropertyTypeSelect(opt.key)}
                      >
                        <span className="property-type-icon">{opt.icon}</span>
                        <span className="property-type-name">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="space-slider">
                    Available Parking/Usable Space: <span className="slider-val">{suitabilityForm.space} sq ft</span>
                  </label>
                  <input
                    type="range"
                    name="space"
                    id="space-slider"
                    min="200"
                    max="5000"
                    step="100"
                    value={suitabilityForm.space}
                    onChange={handleSuitabilityChange}
                    className="range-slider"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', color: '#94a3b8' }}>
                    <span>200 sq ft (1-2 cars)</span>
                    <span>5,000+ sq ft (Heavy hub)</span>
                  </div>
                </div>

                <div className="checker-actions">
                  <div style={{ flexGrow: 1 }}></div>
                  <button className="btn btn-primary" onClick={() => setSuitabilityStep(2)}>
                    Next Step
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`checker-step ${suitabilityStep === 2 ? 'active' : ''}`}>
                <div className="form-group">
                  <label className="form-label" htmlFor="load-slider">
                    Available Electrical Grid/Transformer Load: <span className="slider-val">{suitabilityForm.powerLoad} kW</span>
                  </label>
                  <input
                    type="range"
                    name="powerLoad"
                    id="load-slider"
                    min="10"
                    max="300"
                    step="10"
                    value={suitabilityForm.powerLoad}
                    onChange={handleSuitabilityChange}
                    className="range-slider"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', color: '#94a3b8' }}>
                    <span>10 kW (Light)</span>
                    <span>300 kW (Heavy duty)</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="traffic-select">Vehicle Traffic Levels Nearby</label>
                  <select
                    name="traffic"
                    id="traffic-select"
                    value={suitabilityForm.traffic}
                    onChange={handleSuitabilityChange}
                    className="select-input"
                  >
                    <option value="low">Low Traffic (Private/Local fleet)</option>
                    <option value="medium">Medium Traffic (Frequent commercial visits)</option>
                    <option value="high">High Traffic (Highway corridor/Central junctions)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ownership-select">Land Ownership Status</label>
                  <select
                    name="ownership"
                    id="ownership-select"
                    value={suitabilityForm.ownership}
                    onChange={handleSuitabilityChange}
                    className="select-input"
                  >
                    <option value="owned">Owned Land / Property</option>
                    <option value="leased">Leased / Rented Space</option>
                  </select>
                </div>

                <div className="checker-actions">
                  <button className="btn btn-outline" onClick={() => setSuitabilityStep(1)}>
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={evaluateSuitability}>
                    Calculate Suitability Index
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                </div>
              </div>

              {/* Step 3 (Results) */}
              {suitabilityStep === 3 && suitabilityResult && (
                <div className={`checker-step ${suitabilityStep === 3 ? 'active' : ''}`}>
                  <div className="result-score-circle">
                    <span className="score-num">{suitabilityResult.score}%</span>
                    <span className="score-lbl">SUITABILITY</span>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '22px', marginBottom: '8px' }}>Analysis Report</h4>
                    <p style={{ color: '#475569', fontSize: '15px' }}>{suitabilityResult.summary}</p>
                  </div>

                  <div className="result-card">
                    <div className="result-rec-title">Recommended Charger Range</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', margin: '12px 0', color: '#0f172a' }}>
                      {suitabilityResult.recommendation}
                    </div>
                    <p className="result-rec-desc">
                      This setup offers the best balance of speed, investment cost, and maximum grid utilization for your layout parameters.
                    </p>
                    <a href={`/${suitabilityResult.specSheet}`} target="_blank" className="result-rec-download" rel="noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      View Specs sheet for target ({suitabilityResult.powerTarget}) charger
                    </a>
                  </div>

                  <div className="checker-actions">
                    <button className="btn btn-outline" onClick={() => setSuitabilityStep(1)}>
                      Re-Calculate
                    </button>
                    <a href="#contact" className="btn btn-primary" onClick={() => {
                      setContactForm(prev => ({
                        ...prev,
                        message: `Hi, I ran the suitability check for my ${suitabilityForm.propertyType} property. Space: ${suitabilityForm.space} sqft, Load: ${suitabilityForm.powerLoad}kW. Recommended setup: ${suitabilityResult.recommendation}. Please call me back.`
                      }));
                    }}>
                      Apply For Setup Assistance
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tech & Business Support */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Expert Guidance</span>
            <h2 className="section-title">What Urja Link Helps With</h2>
            <p className="section-subtitle" style={{ color: 'var(--text-muted-light)' }}>
              From planning details to operational execution, our specialists guide you through both technical and business tasks.
            </p>
          </div>

          <div className="guidance-grid">
            <div className="guidance-column">
              <h3 className="guidance-title">
                <div className="guidance-title-icon technical">⚙️</div>
                Technical Guidance
              </h3>
              <ul className="guidance-list">
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Charger selection based on local EV flow
                </li>
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Electrical transformer & grid load studies
                </li>
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Site layout, cable mapping & floor mounting support
                </li>
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Dual-gun connector load balancing configurations
                </li>
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Lightning protection, earthing & fire safeguards
                </li>
              </ul>
            </div>

            <div className="guidance-column">
              <h3 className="guidance-title">
                <div className="guidance-title-icon business">💼</div>
                Business Guidance
              </h3>
              <ul className="guidance-list">
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Location profiling & competitor density map check
                </li>
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Revenue flow calculations per charge cycle
                </li>
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Setting tariff structures & digital wallet integration
                </li>
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Google Maps listing & EV aggregator visibility boost
                </li>
                <li className="guidance-item">
                  <span className="guidance-item-check">✓</span>
                  Promotional branding materials and layout signs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Enquiry Section */}
      <section id="contact" className="section">
        <div className="container">
          <div className="contact-section-inner">
            <div className="contact-info-panel">
              <div>
                <h3>Get In Touch</h3>
                <p className="contact-info-desc">
                  Have questions about grid load requirements, setup costs, or timelines? Reach out and we will clear your doubts.
                </p>
              </div>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-info-icon">📞</div>
                  <div className="contact-info-text">
                    <h5>Call & WhatsApp</h5>
                    <p>+91 8390892417</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">💬</div>
                  <div className="contact-info-text">
                    <h5>Alternate Call</h5>
                    <p>+91 9881022517</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">✉️</div>
                  <div className="contact-info-text">
                    <h5>Email Support</h5>
                    <p>urjalinkev@gmail.com</p>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', opacity: 0.7 }}>
                * Final charger capacity recommendations, site drawings, and budgets are finalized post physical evaluation of grid meters.
              </div>
            </div>

            <div className="contact-form-panel">
              <h3>Start Your Journey</h3>
              {contactSubmitted ? (
                <div className="form-success-msg">
                  ✓ Thank you! Our EV Setup Specialist will get in touch with you shortly on your phone/email.
                </div>
              ) : null}
              <form onSubmit={handleContactSubmit}>
                <div className="contact-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-name">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      id="contact-name"
                      placeholder="e.g. Rahul Sharma"
                      required
                      value={contactForm.name}
                      onChange={handleContactChange}
                      className="form-control-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-phone">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      name="phone"
                      id="contact-phone"
                      placeholder="e.g. +91 9988776655"
                      required
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      className="form-control-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="contact-email"
                    placeholder="e.g. rahul@example.com"
                    required
                    value={contactForm.email}
                    onChange={handleContactChange}
                    className="form-control-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-location">Location / City of Property</label>
                  <input
                    type="text"
                    name="location"
                    id="contact-location"
                    placeholder="e.g. Lonavala, Maharashtra"
                    required
                    value={contactForm.location}
                    onChange={handleContactChange}
                    className="form-control-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">Property Description & Details</label>
                  <textarea
                    name="message"
                    id="contact-message"
                    rows="4"
                    placeholder="Provide details like: total area available, approximate load capability, highway access details..."
                    required
                    value={contactForm.message}
                    onChange={handleContactChange}
                    className="form-control-textarea"
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Project Details
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <div className="footer-logo">
                <span className="logo-text-blue">URJA</span>
                <span className="logo-text-green"> LINK</span>
              </div>
              <p className="footer-desc">
                Enabling Indian properties to host premium EV fast-charging stations. Helping landowners transition spaces into profit-generating charging hubs.
              </p>
            </div>
            <div>
              <h4 className="footer-heading">Navigation</h4>
              <ul className="footer-links">
                <li><a href="#benefits">Benefits</a></li>
                <li><a href="#process">Process</a></li>
                <li><a href="#catalog">Hardware Range</a></li>
                <li><a href="#checker">Suitability Check</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-heading">Downloads</h4>
              <ul className="footer-links">
                <li><a href="/URJA LINK BROCHURE.pdf" target="_blank" rel="noreferrer">Urja Link Brochure</a></li>
                <li><a href="/TECHNICAL SPECS 60kw.pdf" target="_blank" rel="noreferrer">60kW Charger Specs</a></li>
                <li><a href="/TECHNICAL SPECS 120kw.pdf" target="_blank" rel="noreferrer">120kW Charger Specs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-heading">Contact Info</h4>
              <ul className="footer-contact">
                <li>
                  <span className="footer-contact-icon">📞</span>
                  +91 8390892417
                </li>
                <li>
                  <span className="footer-contact-icon">💬</span>
                  +91 9881022517
                </li>
                <li>
                  <span className="footer-contact-icon">✉️</span>
                  urjalinkev@gmail.com
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} Urja Link. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/918390892417?text=Hi,%20I'm%20interested%20in%20setting%20up%20an%20EV%20charging%20station%20with%20Urja%20Link."
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact Urja Link on WhatsApp"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      </a>
    </div>
  );
}

export default App;
