// All site content, taken from the current Gohar website (gohar-rcsi.vercel.app).
// Edit text here, then run: npm run build

export const company = {
  name: 'Gohar Group of Companies',
  tagline: 'Where relationships come first.',
  intro: 'Gohar Group of Companies is a Karachi-based group known for real estate development, construction and building. Its portfolio spans apartments, shopping centres, commercial buildings and gated communities in Karachi and Hyderabad.',
  phone: '+92 21 111 000 061',
  phoneHref: 'tel:+9221111000061',
  email: 'info@gohargoc.com',
  whatsapp: '923373723420',
  officeShort: 'Gohar Chamber, Shahra-e-Faisal, Karachi',
  office: 'A/2, Gohar Chamber, CC Area, Shahra-e-Faisal, Near Duty Free Shop, Kathiawar Society Block 7/8, Karachi, Pakistan',
  mapUrl: 'https://maps.google.com/?cid=16029177641268874238',
  hours: 'Monday to Saturday, 11:00 AM – 8:00 PM',
  closed: 'Sunday: closed',
  purpose: 'To build safe, legally sound communities where trust is foundational and relationships always come first.',
  mission: 'To rebuild and sustain customer loyalty by prioritizing transparent communication, resolving past delivery delays, and proving every day that we believe in relationships.',
  promise: 'Where Relationships Come First. We build with clarity, serve with intent, and design every interaction around long-term trust.',
  // Form backend. Leave empty: forms open WhatsApp / the visitor's email app with the message ready to send.
  // Set to an HTTPS endpoint that accepts a JSON POST to send forms directly (see README).
  formEndpoint: '',
  // Gohar Assistant: optional AI endpoint. Leave empty: the assistant answers from this website's content.
  // Set to an HTTPS endpoint that accepts { message, history, context } and returns { reply } to add AI answers (see README).
  assistantEndpoint: 'api/assistant',
};

// Home hero media. No real footage was found on the source site, so 'video' is empty and the hero shows
// a photographic motion piece made from official renders and photographs (tools/make-films.mjs).
// To use real footage later: set video to e.g. 'assets/video/film/hero.mp4' (+ videoPoster) and rebuild.
export const heroMedia = {
  // DEMO FOOTAGE: free licensed stock clips from Pexels (pexels.com/license, commercial use allowed),
  // NOT Gohar buildings. Hero clips (close-up dark glass, slow push-in): 9874596, 10191124, 37196426, 9701001,
  // 18484700; band 4308110; footer 10227696. Replace with Gohar's own drone
  // film before launch, or set video to '' to go back to the photographic preview.
  video: 'assets/video/stock/hero.mp4', videoMobile: 'assets/video/stock/hero-mobile.mp4', videoPoster: 'assets/video/stock/hero.jpg', stock: true,
  motion: 'assets/video/hero.mp4', poster: 'assets/video/hero.jpg',
  // the motion piece is built from these frames, in order; the hero caption follows them
  size: [1600, 900], clip: 4.6, fade: 1,
  frames: [
    ['gohar-gateway/exterior.webp', 'gohar-gateway'],
    ['141-broadway-heights/dusk.jpg', '141-broadway-heights'],
    ['gohar-golf-vista/golf-course.webp', 'gohar-golf-vista'],
    ['gohar-residencia-shopping-mall/render-008.webp', 'gohar-residencia-shopping-mall'],
    ['kn-gohar-green-city/view-2.jpg', 'kn-gohar-green-city'],
  ],
};

// About page hero media (photographic motion, same rules as above)
export const aboutMedia = {
  video: '', videoPoster: '',
  motion: 'assets/video/about.mp4', poster: 'assets/video/about.jpg',
  size: [1600, 900], clip: 5, fade: 1,
  frames: [
    ['gohar-towers/exterior.jpg', 'gohar-towers'],
    ['kn-gohar-green-city/view-1.jpg', 'kn-gohar-green-city'],
    ['gohar-villas/gate.jpg', 'gohar-villas'],
    ['gohar-golf-vista/towers-aerial.webp', 'gohar-golf-vista'],
  ],
};

export const values = [
  ['Trust First', 'We believe credibility is earned through transparent communication and consistent delivery.'],
  ['Design With Purpose', 'Every decision should improve how people live, invest, and experience space.'],
  ['Excellence In Detail', 'From presentation to execution, quality should be visible in every touchpoint.'],
  ['Relationships That Last', 'We aim to create long-term value, not short-term transactions.'],
];

export const categories = {
  residential: { label: 'Residential', text: 'Apartment towers and family homes, from Gulshan-e-Iqbal to the edge of the ACACIA golf course.' },
  commercial: { label: 'Commercial', text: 'Shopping centres, shops and offices, from Tariq Road to Korangi Link Road.' },
  'mixed-use': { label: 'Mixed Use', text: 'Homes above retail and workspace: addresses where people live, shop and meet.' },
  community: { label: 'Communities', text: 'Gated, master-planned neighbourhoods with streets, parks and shared facilities.' },
};

const DOCS = 'https://gohar-rcsi.vercel.app/documents/';

export const projects = [
  {
    slug: '141-broadway-heights', name: '141 Broadway Heights', area: 'DHA Phase 1', city: 'Karachi',
    category: 'mixed-use', status: 'Now booking', featured: true,
    headline: 'Where modern living meets prime commerce',
    summary: 'Luxury apartments and modern commercial outlets in DHA Phase 1, Karachi, with an infinity pool, rooftop garden, gym and co-working space.',
    lead: 'Spacious 3 & 4-room apartments and premium commercial / office spaces',
    story: [
      'Rising along Korangi Road in DHA Phase 1, 141 Broadway Heights brings spacious contemporary residences and premium commercial spaces together at a well-connected Karachi address.',
      'The project is planned for modern family living, with 3- and 4-room apartments and a range of shared amenities: an infinity swimming pool with a rooftop deck, a rooftop garden, a commercial-sized gym and a dedicated co-working space.',
      'Shahrah-e-Faisal, Khayaban-e-Ittehad and the newly developed Shahrah-e-Bhutto are all within easy reach, linking residents and businesses to key destinations across the city.',
    ],
    facts: [['Towers', '1'], ['Floors', 'Basement, LG, UG, 3 parking levels, 8 residential floors and roof'], ['Residences', '3 & 4-room apartments'], ['Commercial', 'Commercial outlets and office spaces'], ['Pricing', 'On request']],
    keyStats: [['Towers', '1'], ['Residential floors', '8'], ['Apartments', '3 & 4-room']],
    amenities: ['Infinity pool with rooftop deck', 'Rooftop garden', 'Commercial-sized gym', 'Co-working space'],
    hero: 'dusk.jpg', card: 'exterior.jpg', look: 'cinema', tone: '#151a24',
    media: { video: '', videoPoster: '', motion: 'assets/video/141-broadway-heights.mp4', poster: 'assets/video/141-broadway-heights.jpg' },
    gallery: ['exterior.jpg', 'rooftop-pool.jpg', 'terrace.jpg', 'living.jpg', 'bedroom.jpg', 'dusk.jpg'],
    plans: [['plan-basement.jpg', 'Basement'], ['plan-typical-residential.jpg', 'Typical residential floor'], ['plan-roof.jpg', 'Roof']],
    address: 'Plot #141, 17th Street East, Main Korangi Road, beside Toyota Defence Motors, DHA Phase 1, Karachi',
    nearby: ['Beside Toyota Defence Motors', 'DHA Phase 1 Gold Mark', 'NADRA Mega Center', 'Main Korangi Road', 'Shahrah-e-Faisal', 'Khayaban-e-Ittehad', 'Shahrah-e-Bhutto'],
    brochure: [DOCS + '141-broadway-heights-presentation-book.pdf', 'Presentation book (PDF, 13 MB)'],
  },
  {
    slug: 'gohar-gateway', name: 'Gohar Gateway', area: 'Hyderabad', city: 'Hyderabad',
    category: 'mixed-use', featured: true,
    headline: 'A new benchmark for living in Hyderabad',
    summary: 'A mixed-use development in Hyderabad with flats, shops, a banquet, a restaurant and entertainment areas.',
    lead: '2, 3 and 4-room apartments with retail, banquet and dining',
    story: [
      'Gohar Gateway is a mixed-use development on the main Hyderabad Bypass Road, opposite Hyderabad Darbar Hotel.',
      'It offers 4-room apartments (Type A, A1), 3-room apartments (Type B, B1, B2, B3) and 2-room apartments (Type C, C1, C2), along with commercial outlets, a banquet, a restaurant and entertainment areas.',
      "In July 2026 the company announced the signing of Pakistan's first Shariah-compliant green hotel REIT, anchored at Gohar Gateway, with JS Investments.",
    ],
    facts: [['City', 'Hyderabad'], ['Residences', '2, 3 and 4-room apartments'], ['Commercial', 'Commercial outlets'], ['Leisure', 'Banquet, restaurant and entertainment area'], ['Hospitality', 'Anchor of a Shariah-compliant green hotel REIT with JS Investments (announced July 2026)'], ['Payment', "Instalment plan to possession (published as a '3 Year Payment Plan')"]],
    keyStats: [['Apartment types', '9'], ['Rooms', '2 – 4'], ['City', 'Hyderabad']],
    layouts: [['4 rooms', 'Type A and Type A1'], ['3 rooms', 'Type B, B1, B2 and B3'], ['2 rooms', 'Type C, C1 and C2']],
    amenities: ['Banquet', 'Restaurant', 'Entertainment area', 'Commercial outlets'],
    hero: 'exterior.webp', card: 'hotel-tower.jpg', look: 'cinema', tone: '#241d16',
    media: { video: '', videoPoster: '', motion: 'assets/video/gohar-gateway.mp4', poster: 'assets/video/gohar-gateway.jpg' },
    gallery: ['exterior.webp', 'aerial-courtyard.webp', 'hotel-tower.jpg', 'courtyard.jpg'],
    payment: {
      terms: '10% each on booking, confirmation, allocation and start of work + 48 monthly instalments + 8 half-yearly instalments + 10% before possession',
      rows: [
        ['Type A1', '4 rooms', 'PKR 22,200,000', '48 × PKR 100,000 monthly · 8 × PKR 787,500 half-yearly'],
        ['Type A', '4 rooms', 'PKR 21,200,000', '48 × PKR 100,000 monthly · 8 × PKR 725,000 half-yearly'],
        ['Type B1', '3 rooms', 'PKR 16,800,000', '48 × PKR 75,000 monthly · 8 × PKR 600,000 half-yearly'],
        ['Type B', '3 rooms', 'PKR 16,300,000', '48 × PKR 75,000 monthly · 8 × PKR 568,750 half-yearly'],
        ['Type B2', '3 rooms', 'PKR 16,300,000', '48 × PKR 75,000 monthly · 8 × PKR 568,750 half-yearly'],
        ['Type B3', '3 rooms', 'PKR 15,900,000', '48 × PKR 75,000 monthly · 8 × PKR 543,750 half-yearly'],
        ['Type C', '2 rooms', 'PKR 11,200,000', '48 × PKR 40,000 monthly · 8 × PKR 460,000 half-yearly'],
        ['Type C1', '2 rooms', 'PKR 10,800,000', '48 × PKR 40,000 monthly · 8 × PKR 435,000 half-yearly'],
        ['Type C2', '2 rooms', 'PKR 10,700,000', '48 × PKR 40,000 monthly · 8 × PKR 428,750 half-yearly'],
      ],
    },
    address: 'Main Hyderabad Bypass Road, opposite Hyderabad Darbar Hotel, Hyderabad',
    nearby: ['Opposite Hyderabad Darbar Hotel', 'Main Hyderabad Bypass Road'],
  },
  {
    slug: 'gohar-golf-vista', name: 'Gohar Golf Vista', area: 'Gulshan-e-Roomi', city: 'Karachi',
    category: 'residential', featured: true,
    headline: 'Live above the ordinary',
    summary: 'Luxury 3, 4 and 5-bedroom apartments with golf course views, near ACACIA Golf Club.',
    lead: 'Luxury 3, 4 and 5-bedroom apartments beside the ACACIA golf course',
    story: [
      'Gohar Golf Vista is among the rare residential projects in Karachi set beside a golf course. Located next to the ACACIA Country & Golf Club, it offers 3, 4 and 5-bedroom luxury apartments with views across the course.',
      'The company describes the building as having an earthquake-resilient structure. It rises 13 floors above basement and ground-floor parking.',
    ],
    facts: [['Floors', 'Basement parking, ground-floor parking and 13 floors'], ['Residences', '3, 4 and 5-bedroom apartments'], ['Setting', 'Next to ACACIA Golf Club'], ['Structure', 'Earthquake-resilient (as stated by the developer)'], ['Home financing', 'Islamic home financing with Meezan Bank (partnership announced July 2026)'], ['Pricing', 'On request']],
    keyStats: [['Floors', '13'], ['Bedrooms', '3 – 5'], ['Setting', 'Golf course']],
    hero: 'golf-course.webp', card: 'exterior.webp', look: 'cinema', tone: '#17221b',
    media: { video: '', videoPoster: '', motion: 'assets/video/gohar-golf-vista.mp4', poster: 'assets/video/gohar-golf-vista.jpg' },
    gallery: ['exterior.webp', 'golf-course.webp', 'towers-aerial.webp', 'facade-detail.webp', 'balconies.webp'],
    address: 'Near ACACIA Country & Golf Club, Gulshan-e-Roomi, Karachi',
    nearby: ['Adjacent to ACACIA Golf Club'],
    brochure: [DOCS + 'gohar-golf-vista-payment-plan.pdf', 'Payment plan (PDF, 47 MB)'],
  },
  {
    slug: 'gohar-residencia-shopping-mall', name: 'Gohar Residencia & Shopping Mall', area: 'Gulshan-e-Maymar', city: 'Karachi',
    category: 'mixed-use', featured: true,
    headline: 'Four towers, one address',
    summary: 'Four residential towers with 1,033 apartments and a 301-shop shopping mall in Gulshan-e-Maymar.',
    lead: '1,033 apartments and a 301-shop shopping mall',
    story: [
      'Gohar Residencia & Shopping Mall is a mixed-use development in Gulshan-e-Maymar with four 14-floor residential towers, 1,033 apartments and a 301-shop retail mall, combining apartment living with everyday commercial convenience.',
      'Homes come in three configurations: Type A 3-bed lounge in Towers 1 & 2, and Type B 2-bed lounge and Type C 1-bed lounge in Towers 3 & 4, with prices that vary by floor band.',
    ],
    facts: [['Towers', '4'], ['Floors', '14'], ['Apartments', '1,033'], ['Shops', '301'], ['Payment', 'Payment plan available']],
    keyStats: [['Towers', '4'], ['Apartments', '1,033'], ['Shops', '301']],
    layouts: [['Type A · 3 bed lounge', '1,200 sq ft gross (867 sq ft net) · Towers 1 & 2'], ['Type B · 2 bed lounge', '850 sq ft gross (543 sq ft net) · Towers 3 & 4'], ['Type C · 1 bed lounge', '550 sq ft gross (377 sq ft net) · Towers 3 & 4']],
    hero: 'render-010.webp', card: 'street-view.jpg', look: 'cinema', tone: '#1b2024',
    media: { video: '', videoPoster: '', motion: 'assets/video/gohar-residencia-shopping-mall.mp4', poster: 'assets/video/gohar-residencia-shopping-mall.jpg' },
    gallery: ['render-010.webp', 'street-view.jpg', 'render-008.webp', 'aerial.jpg', 'render-005.webp', 'render-001.webp'],
    payment: {
      terms: 'Prices vary by floor band.',
      rows: [
        ['Type A', '3 bed lounge', 'PKR 10,964,100 – 11,654,100', 'Depending on floor band'],
        ['Type B', '2 bed lounge', 'PKR 6,883,900 – 7,573,900', 'Depending on floor band'],
        ['Type C', '1 bed lounge', 'PKR 4,777,100 – 5,467,100', 'Depending on floor band'],
      ],
    },
    address: 'Gulshan-e-Maymar, Karachi',
    nearby: ['In the heart of Gulshan-e-Maymar'],
  },
  {
    slug: 'gohar-towers', name: 'Gohar Towers', area: 'Gulshan-e-Iqbal', city: 'Karachi',
    category: 'residential', status: 'Completed',
    headline: 'Completed homes in Gulshan-e-Iqbal',
    summary: 'A completed residential project in Gulshan-e-Iqbal with Executive, Prime and Premium apartments across three towers.',
    lead: 'Executive, Prime and Premium apartments across three towers',
    story: [
      'Gohar Towers is a completed residential apartment project in Block 13-E, Gulshan-e-Iqbal, Karachi, offering apartment living across three towers in a well-established neighbourhood.',
      'Apartments come in three categories: Executive (6 rooms), Prime (5 rooms) and Premium (5 rooms).',
    ],
    facts: [['Towers', '3'], ['Residences', '5 and 6-room apartments'], ['Status', 'Completed']],
    keyStats: [['Towers', '3'], ['Rooms', '5 – 6'], ['Status', 'Ready']],
    layouts: [['Executive', '6 rooms'], ['Prime', '5 rooms'], ['Premium', '5 rooms']],
    hero: 'exterior.jpg', card: 'towers-sky.jpg', look: 'split', tone: '#1f1f1b',
    // no photographic motion: only two source images, one of them low-resolution
    media: { video: '', videoPoster: '', motion: '', poster: '' },
    gallery: ['exterior.jpg', 'towers-sky.jpg'],
    payment: {
      terms: '50% on booking + 3 monthly instalments + balance before possession + documentation charges',
      rows: [
        ['Prime Suite', '5 rooms', 'PKR 26,560,000', 'Booking PKR 13,280,000 · 3 × PKR 2,900,000 · PKR 2,380,000 before possession · PKR 2,200,000 documentation'],
        ['Premium Suite', '5 rooms', 'PKR 27,400,000', 'Booking PKR 13,700,000 · 3 × PKR 3,000,000 · PKR 2,500,000 before possession · PKR 2,200,000 documentation'],
        ['Executive', '6 rooms', 'PKR 34,600,000', 'Booking PKR 17,300,000 · 3 × PKR 3,500,000 · PKR 4,000,000 before possession · PKR 2,800,000 documentation'],
      ],
    },
    address: 'Block 13-E, Gulshan-e-Iqbal, Karachi 75300',
    nearby: ['Block 13-E, Gulshan-e-Iqbal'],
  },
  {
    slug: 'gohar-complex-shopping-mall', name: 'Gohar Complex & Shopping Mall', area: 'Model Colony', city: 'Karachi',
    category: 'mixed-use', status: 'Completed',
    headline: 'Ready homes above everyday retail',
    summary: 'A completed mixed-use development in Model Colony offering flats and shops across five towers.',
    lead: 'Flats and ground-floor shops across five towers',
    story: [
      'Gohar Complex & Shopping Mall is a mixed-use development on Liaquat Ali Khan Road, Model Colony Block 9, Tina Square, Karachi, offering flats and shops across five towers.',
      'It offers three apartment categories: Type A (5 rooms), Type B (4 rooms) and Type B1 (3 rooms), with commercial shops on the ground floor. As a completed project, it provides ready residential and commercial spaces.',
    ],
    facts: [['Towers', '5'], ['Residences', '3, 4 and 5-room flats'], ['Commercial', 'Shops on the ground floor'], ['Home financing', 'Islamic home financing with Meezan Bank (partnership announced July 2026)']],
    keyStats: [['Towers', '5'], ['Rooms', '3 – 5'], ['Status', 'Ready']],
    layouts: [['Type A', '5 rooms'], ['Type B', '4 rooms'], ['Type B1', '3 rooms']],
    hero: 'exterior.jpg', card: 'exterior.jpg', look: 'split', tone: '#231c19',
    // only one official image exists, so no motion piece is made from it
    media: { video: '', videoPoster: '', motion: '', poster: '' },
    gallery: ['exterior.jpg'],
    payment: {
      terms: 'Booking amount + 3 monthly instalments + balance before possession',
      rows: [
        ['Type A', '5 rooms', 'PKR 19,320,000', 'Booking PKR 10,000,000 · 3 × PKR 2,500,000 · PKR 1,820,000 before possession'],
        ['Type B', '4 rooms', 'PKR 13,080,000', 'Booking PKR 7,000,000 · 3 × PKR 1,500,000 · PKR 1,580,000 before possession'],
        ['Type B1', '3 rooms', 'PKR 13,386,000', 'Booking PKR 7,000,000 · 3 × PKR 1,500,000 · PKR 1,886,000 before possession'],
      ],
    },
    address: 'Liaquat Ali Khan Road, Model Colony Block 9, Tina Square, Karachi 75080',
    nearby: ['Tina Square', 'Model Colony Block 9', 'Liaquat Ali Khan Road'],
  },
  {
    slug: 'gohar-green-corner-shopping-center', name: 'Gohar Green Corner & Shopping Center', area: 'Korangi Link Road', city: 'Karachi',
    category: 'commercial',
    headline: 'The smart destination for business',
    summary: '411 commercial shops on Korangi Link Road with strong street exposure.',
    lead: '411 shops on Korangi Link Road, behind Malir Court',
    story: [
      'Gohar Green Corner & Shopping Center is a dedicated commercial project of 411 shops on Korangi Link Road, behind Malir Court.',
      'It stands opposite KN Gohar Green City, giving retailers commercial exposure to a large residential catchment across the road.',
    ],
    facts: [['Buildings', '1'], ['Floors', 'Ground + 5'], ['Floor plans', 'Basement parking, lower ground, upper ground and 1st–5th floors'], ['Shops', '411'], ['Pricing', 'On request']],
    keyStats: [['Shops', '411'], ['Floors', 'G + 5'], ['Buildings', '1']],
    hero: 'exterior.jpg', card: 'brochure-exterior.jpg', look: 'split', tone: '#2a1714',
    media: { video: '', videoPoster: '', motion: 'assets/video/gohar-green-corner-shopping-center.mp4', poster: 'assets/video/gohar-green-corner-shopping-center.jpg' },
    gallery: ['exterior.jpg', 'brochure-exterior.jpg', 'street-view.jpg'],
    plans: [['plan-basement.jpg', 'Basement'], ['plan-lower-ground.jpg', 'Lower ground'], ['plan-upper-ground.jpg', 'Upper ground'], ['plan-1st-4th.jpg', '1st & 4th floor'], ['plan-2nd-3rd-5th.jpg', '2nd, 3rd & 5th floor']],
    address: 'Korangi Link Road, behind Malir Court, Karachi',
    nearby: ['Opposite KN Gohar Green City', 'Behind Malir Court', 'Korangi Link Road'],
    brochure: [DOCS + 'gohar-green-corner-shopping-center-presentation-book.pdf', 'Presentation book (PDF, 34 MB)'],
  },
  {
    slug: 'gohar-rabi-center', name: 'Gohar Rabi Center', area: 'PECHS', city: 'Karachi',
    category: 'commercial',
    headline: 'A central address on Tariq Road',
    summary: 'Shops and offices in PECHS, Karachi, at a prime location next to Rabi Centre on Tariq Road.',
    lead: 'Shops and offices next to Rabi Centre, Tariq Road',
    story: [
      'Gohar Rabi Center is a commercial development in PECHS, Karachi, offering shops and offices in a central location next to Rabi Centre on Tariq Road.',
      'The scheme is planned across lower ground, upper ground and first to seventh floors, with structured commercial circulation and frontage on major surrounding roads. It comes with a 1-year payment plan and possession on 50% payment, as published.',
    ],
    facts: [['Buildings', '1'], ['Floors', 'Lower ground, upper ground and 1st to 7th floors'], ['Space types', 'Shops and offices'], ['Payment', '1-year payment plan, possession on 50% payment (as published)'], ['Pricing', 'On request']],
    keyStats: [['Floors', 'LG + UG + 7'], ['Spaces', 'Shops & offices'], ['Plan', '1 year']],
    hero: 'day-view.jpg', card: 'day-view.jpg', look: 'split', tone: '#242019',
    // only one official image exists, so no motion piece is made from it
    media: { video: '', videoPoster: '', motion: '', poster: '' },
    gallery: ['day-view.jpg'],
    address: 'Plot No. 171/1-A, Block 3, PECHS, Karachi',
    nearby: ['Adjacent to Rabi Centre, Tariq Road', 'Tariq Road'],
  },
  {
    slug: 'gohar-villas', name: 'Gohar Villas', area: 'Taiser Town', city: 'Karachi',
    category: 'mixed-use',
    headline: 'Plots for the life you plan',
    summary: 'A residential and commercial plots community in three phases near Taiser Town and Gulshan-e-Maymar.',
    lead: 'Residential and commercial plots in three phases',
    story: [
      'Gohar Villas is a three-phase residential and commercial plots project at Sector 61, Taiser Town, next to Gulshan-e-Maymar, Karachi.',
      'Phases 1 and 2 offer residential plots of 120 and 160 sq yd. Phase 3 offers 120 sq yd residential plots and commercial plots of 100 and 200 sq yd.',
    ],
    facts: [['Phases', '3'], ['Plot sizes', '100, 120, 160 and 200 sq yd'], ['Plot types', 'Residential (all phases) and commercial (Phase 3)'], ['Payment', '36-month instalment plan (as published)']],
    keyStats: [['Phases', '3'], ['Plot sizes', '100 – 200 sq yd'], ['Plan', '36 months']],
    layouts: [['Phase 1', 'Residential plots of 120 and 160 sq yd'], ['Phase 2', 'Residential plots of 120 and 160 sq yd'], ['Phase 3', 'Residential plots of 120 sq yd; commercial plots of 100 and 200 sq yd']],
    hero: 'gate.jpg', card: 'gate-approach.webp', look: 'frame', tone: '#1d2219',
    media: { video: '', videoPoster: '', motion: 'assets/video/gohar-villas.mp4', poster: 'assets/video/gohar-villas.jpg' },
    gallery: ['gate.jpg', 'gate-approach.webp', 'park.jpg', 'community-centre.jpg', 'masjid.jpg', 'hospital.jpg', 'commercial-area.webp', 'masterplan.jpg'],
    plans: [['masterplan-phase-1.webp', 'Phase 1 masterplan'], ['masterplan-phase-2.webp', 'Phase 2 masterplan'], ['masterplan-phase-3.webp', 'Phase 3 masterplan']],
    payment: {
      terms: '10% each on booking, confirmation and allocation + 36 monthly + 6 half-yearly instalments + 10% before possession + documentation / development / utility charges',
      rows: [
        ['Phase 1', '120 sq yd residential', 'PKR 7,705,000', '36 × PKR 48,000 · 6 × PKR 282,495 · + PKR 1,200,000 charges'],
        ['Phase 1', '160 sq yd residential', 'PKR 10,120,000', '36 × PKR 64,500 · 6 × PKR 358,333 · + PKR 1,600,000 charges'],
        ['Phase 2', '120 sq yd residential', 'PKR 6,900,000', '36 × PKR 35,000 · 6 × PKR 280,000 · + PKR 1,200,000 charges'],
        ['Phase 2', '160 sq yd residential', 'PKR 8,740,000', '36 × PKR 50,000 · 6 × PKR 307,333 · + PKR 1,600,000 charges'],
        ['Phase 3', '120 sq yd residential', 'PKR 5,405,000', '36 × PKR 25,000 · 6 × PKR 190,500 · + PKR 1,200,000 charges'],
        ['Phase 3', '100 sq yd commercial', 'PKR 8,050,000', '36 × PKR 50,000 · 6 × PKR 338,333 · + PKR 1,000,000 charges'],
        ['Phase 3', '200 sq yd commercial', 'PKR 16,100,000', '36 × PKR 80,000 · 6 × PKR 796,666 · + PKR 2,000,000 charges'],
      ],
    },
    address: 'M-10, Sector 61, Taiser Town, adjacent to Gulshan-e-Maymar, Karachi 75500',
    nearby: ['Near Taiser Town', 'Next to Gulshan-e-Maymar'],
  },
  {
    slug: 'kn-gohar-green-city', name: 'KN Gohar Green City', area: 'Malir', city: 'Karachi',
    category: 'community', categoryLabel: 'Residential & Commercial Community',
    headline: 'More than a home: a complete lifestyle community',
    summary: 'A gated, master-planned community near Malir with a club house, pool and green spaces.',
    lead: 'A complete lifestyle community in the middle of the city',
    story: [
      'Set along the Korangi Road Link off Shahrah-e-Faisal, KN Gohar Green City is a master-planned, gated community built on the idea that a home should come with more than four walls: it should come with a lifestyle.',
      'It is close to Malir Cantt and Jamia Millia Road and within easy reach of Jinnah Terminal, connecting residents to the rest of Karachi while offering the calm of a self-contained township.',
      'Buildings rise four floors above a basement and a ground-floor commercial market, with SBS flats and residential apartments.',
    ],
    facts: [['Buildings', 'Basement, ground-floor commercial market and 4 floors'], ['Residences', 'SBS flats and residential apartments'], ['Community', 'Gated, master-planned'], ['Pricing', 'On request']],
    keyStats: [['Community', 'Gated'], ['Floors', 'B + G + 4'], ['Amenities', '6+']],
    layouts: [['Platinum', '120 sq yd, one unit'], ['Gold', '120 sq yd, single storey'], ['Silver', '80 sq yd, single storey'], ['Apartments', 'Types A, B, C and D']],
    amenities: ['Club house', 'Swimming pool', 'Mini golf', "Children's play area", 'Basketball court', 'Security control room'],
    hero: 'view-3.jpg', card: 'photo-club-house.jpg', look: 'frame', tone: '#16211a',
    media: { video: '', videoPoster: '', motion: 'assets/video/kn-gohar-green-city.mp4', poster: 'assets/video/kn-gohar-green-city.jpg' },
    gallery: ['photo-club-house.jpg', 'photo-lawn.jpg', 'photo-garden-walk.jpg', 'photo-street.jpg', 'photo-facade.jpg', 'view-1.jpg', 'view-2.jpg', 'view-3.jpg'],
    plans: [['master-layout-plan.jpg', 'Master layout plan']],
    address: 'Korangi Road Link, off Shahrah-e-Faisal, near the Malir Court area, Karachi',
    nearby: ['Near Malir Court', 'Malir Cantt', 'Jamia Millia Road', 'Jinnah Terminal', 'Opposite Gohar Green Corner', 'Shahrah-e-Faisal'],
    brochure: [DOCS + 'kn-gohar-green-city-presentation.pdf', 'Presentation (PDF, 12 MB)'],
  },
];

// Gohar Stories articles live in tools/stories.mjs
export { stories } from './stories.mjs';

export const faqs = [
  ['How do I enquire about a project?', 'Use the enquiry form on any project page or on our contact page, call our UAN +92 21 111 000 061, or email info@gohargoc.com. Our team responds during office hours (Monday to Saturday, 11:00 AM – 8:00 PM).'],
  ['Can I visit a project site?', 'Yes. Schedule a site visit: tell us the project and the days that suit you, and our team will call you to confirm the visit.'],
  ['Are payment plans available?', 'Payment plans are published for Gohar Gateway, Gohar Towers, Gohar Complex & Shopping Mall, Gohar Residencia & Shopping Mall and Gohar Villas. Plans and terms change over time, so please ask our sales team for the current details.'],
  ['Why are some prices not shown?', 'Prices and availability change, and we want you to receive accurate figures. Request current pricing through the enquiry form or by phone and our team will share the latest details.'],
  ['I live overseas. Can I enquire?', 'Yes. Select “Overseas” as your city on the enquiry form and include an international phone number. Our team will contact you by phone or email.'],
  ['Where can I download a brochure?', 'Official brochures are available on the project pages for 141 Broadway Heights, Gohar Golf Vista, Gohar Green Corner & Shopping Center and KN Gohar Green City. For other projects, ask our team for the latest material.'],
  ['Where is your head office?', 'A/2, Gohar Chamber, CC Area, Shahra-e-Faisal, Near Duty Free Shop, Kathiawar Society Block 7/8, Karachi, Pakistan. Open Monday to Saturday, 11:00 AM – 8:00 PM. Sunday: closed.'],
];
