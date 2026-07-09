// Texas Tech School of Law Success Guide
//
// Curriculum facts (course codes, credit hours, sequencing, clinics, journals,
// OASP, Career Services outcomes) are sourced from official Texas Tech School
// of Law publications (depts.ttu.edu/law) as of 2026. Course content
// (major topics, landmark cases, study strategies) reflects standard
// treatment of these subjects at ABA-accredited law schools generally,
// clearly distinguished from TTU-specific policy where relevant.

export interface CourseChapter {
  id: string;
  courseCode?: string;
  creditHours?: number;
  year: "1L" | "Upper-Level";
  title: string;
  overview: string;
  purpose: string;
  learningObjectives: string[];
  majorTopics: string[];
  courseStructure: string;
  assessment: string;
  landmarkCases: { name: string; note: string }[];
  studyStrategies: string[];
  commonChallenges: string[];
  resources: string[];
  summary: string;
}

export const FIRST_YEAR_COURSES: CourseChapter[] = [
  {
    id: "intro-to-law",
    courseCode: "LAW 5108",
    creditHours: 1,
    year: "1L",
    title: "Introduction to the Study of Law",
    overview:
      "A short, intensive orientation course taken at the very start of the 1L year. It introduces the structure of the American legal system, the common-law method, and the habits of mind law school expects before students are thrown into full doctrinal courses.",
    purpose:
      "Every other 1L course assumes you already know how to read a case, brief it, and extract a rule from it. This course exists to teach that skill explicitly, rather than leaving students to figure it out under pressure in Torts or Contracts.",
    learningObjectives: [
      "Understand the structure of federal and state court systems and how cases move through them",
      "Read and brief a judicial opinion efficiently",
      "Distinguish holding from dicta, and majority from dissenting or concurring opinions",
      "Understand stare decisis and how precedent binds (or doesn't bind) later courts",
      "Get comfortable with the Socratic method before it shows up in graded courses",
    ],
    majorTopics: [
      "Common law vs. civil law systems",
      "Federal vs. state court structure and jurisdiction basics",
      "Case briefing method (facts, issue, holding, reasoning, disposition)",
      "Stare decisis, precedent, and persuasive vs. binding authority",
      "How to read a casebook and prepare for cold calls",
    ],
    courseStructure:
      "Typically meets for a compressed period at the very beginning of the semester, often before or overlapping with the first week of doctrinal classes. Low-stakes by design — the goal is preparation, not evaluation.",
    assessment:
      "Usually pass/fail or a minor short assignment rather than a heavily weighted exam, since its purpose is orientation rather than testing substantive law.",
    landmarkCases: [
      { name: "Marbury v. Madison", note: "Often used as a first-week teaching case to illustrate how to extract a holding from a lengthy opinion." },
    ],
    studyStrategies: [
      "Treat the case-briefing method taught here as non-negotiable — you will use it in every course all year",
      "Practice briefing 2-3 cases a night even before other classes formally start, to build speed",
      "Ask upper-level students to review one of your briefs early — bad briefing habits are hard to unlearn later",
    ],
    commonChallenges: [
      "Students often underestimate this course because it's low-credit, then arrive at Torts or Contracts without a working case-briefing method",
      "The pace of legal reading (dense, old, formal prose) is a bigger adjustment than most students expect",
    ],
    resources: [
      "Getting to Maybe: How to Excel on Law School Exams (Fischl & Paul)",
      "Law School Legends audio lecture series (short, orientation-focused overviews)",
    ],
    summary:
      "A short course with an outsized effect on the rest of your 1L year. Master case briefing here and every other course gets easier.",
  },
  {
    id: "civil-procedure",
    courseCode: "LAW 5405",
    creditHours: 5,
    year: "1L",
    title: "Civil Procedure",
    overview:
      "Civil Procedure governs how a lawsuit actually moves through court — from filing a complaint to final judgment. It's often the most disorienting 1L course because it's procedural rather than substantive: there's no story to hang the rules on the way there is in Torts or Contracts.",
    purpose:
      "Every civil case, regardless of subject matter, has to pass through the machinery Civil Procedure teaches. Understanding jurisdiction, pleading, and procedure is a prerequisite to practicing in any civil litigation context.",
    learningObjectives: [
      "Determine whether a court has personal jurisdiction over a defendant",
      "Determine whether a federal court has subject-matter jurisdiction (diversity or federal question)",
      "Understand pleading standards and the difference between notice pleading and plausibility pleading",
      "Understand the discovery process and its limits",
      "Understand preclusion doctrines (res judicata and collateral estoppel) and their effect on later litigation",
    ],
    majorTopics: [
      "Personal jurisdiction (minimum contacts, specific vs. general jurisdiction)",
      "Subject-matter jurisdiction (federal question, diversity, supplemental jurisdiction)",
      "Venue and forum non conveniens",
      "The Erie doctrine (state law in federal court)",
      "Pleadings (Rule 8, Rule 12(b)(6) motions to dismiss)",
      "Joinder of parties and claims",
      "Discovery (scope, work-product doctrine, privilege)",
      "Summary judgment (Rule 56)",
      "Preclusion (claim preclusion and issue preclusion)",
      "The right to a jury trial (Seventh Amendment)",
    ],
    courseStructure:
      "Taught primarily through the Federal Rules of Civil Procedure and a heavy diet of Supreme Court cases interpreting jurisdictional and procedural limits. Expect dense statutory-interpretation-style reading alongside case law.",
    assessment:
      "Usually a single closed- or open-book final exam with issue-spotting fact patterns (e.g., 'can this defendant be sued in this state?'). Some sections include a jurisdiction-focused midterm.",
    landmarkCases: [
      { name: "Pennoyer v. Neff", note: "Foundational personal jurisdiction case establishing the territorial theory courts later moved away from." },
      { name: "International Shoe Co. v. Washington", note: "Introduces the 'minimum contacts' test that still governs personal jurisdiction analysis today." },
      { name: "World-Wide Volkswagen Corp. v. Woodson", note: "Applies minimum contacts to a stream-of-commerce fact pattern; frequently tested." },
      { name: "Erie Railroad Co. v. Tompkins", note: "Establishes that federal courts sitting in diversity apply state substantive law." },
      { name: "Bell Atlantic Corp. v. Twombly / Ashcroft v. Iqbal", note: "Set the modern 'plausibility' pleading standard under Rule 8." },
    ],
    studyStrategies: [
      "Build a jurisdiction flowchart early (personal jurisdiction → subject-matter jurisdiction → venue) and keep refining it all semester",
      "Civ Pro rewards issue-spotting practice more than memorization — work through hypotheticals weekly, not just before the exam",
      "Keep the Federal Rules of Civil Procedure open next to your casebook; know the rule number, not just the concept",
    ],
    commonChallenges: [
      "The subject feels abstract with no obvious 'story,' which makes it easy to fall behind on outlining",
      "Jurisdiction analysis has many overlapping, similarly-worded tests that are easy to conflate under exam pressure",
    ],
    resources: [
      "Examples & Explanations: Civil Procedure (Glannon)",
      "Civil Procedure: A Modern Approach (commonly assigned casebook series)",
      "CALI lessons on personal jurisdiction and subject-matter jurisdiction",
    ],
    summary:
      "Dense and procedural, but foundational to every other litigation-adjacent course. A strong jurisdictional flowchart, built early and revised often, is the single best investment you can make in this course.",
  },
  {
    id: "constitutional-law",
    courseCode: "LAW 5401",
    creditHours: 4,
    year: "1L",
    title: "Constitutional Law",
    overview:
      "Constitutional Law examines the structure and limits of governmental power under the U.S. Constitution — separation of powers, federalism, and (depending on the sequencing at your school) individual rights. Texas Tech offers this in the first year, earlier than many peer schools.",
    purpose:
      "Constitutional Law underlies nearly every area of public law practice and shows up constantly in litigation involving government action, regulation, and individual rights.",
    learningObjectives: [
      "Understand judicial review and the Supreme Court's role in constitutional interpretation",
      "Analyze the scope of federal legislative power under the Commerce Clause and other enumerated powers",
      "Understand separation of powers among the three branches",
      "Apply levels of scrutiny (rational basis, intermediate, strict) to government action",
      "Understand the incorporation doctrine and its effect on state action",
    ],
    majorTopics: [
      "Judicial review and justiciability (standing, ripeness, mootness, political question doctrine)",
      "Federal legislative power (Commerce Clause, Necessary and Proper Clause, Taxing and Spending power)",
      "Separation of powers (executive power, legislative delegation, checks and balances)",
      "Federalism and the Tenth Amendment",
      "The Dormant Commerce Clause",
      "State action doctrine",
      "Equal Protection and Due Process frameworks (often introduced here, expanded later)",
    ],
    courseStructure:
      "Heavy Supreme Court casebook work, often organized historically (Marshall Court → New Deal era → modern doctrine) so students see how doctrine shifted over time rather than as a static rule set.",
    assessment:
      "Typically a single essay-based final exam applying multiple constitutional doctrines to a fact pattern involving government action; some professors include multiple-choice components testing doctrinal precision.",
    landmarkCases: [
      { name: "Marbury v. Madison", note: "Establishes judicial review — the power of courts to strike down unconstitutional laws." },
      { name: "McCulloch v. Maryland", note: "Broadly construes federal power under the Necessary and Proper Clause." },
      { name: "Gibbons v. Ogden", note: "Early, expansive reading of the Commerce Clause." },
      { name: "Wickard v. Filburn", note: "High-water mark of Commerce Clause power, reaching purely local/private activity with aggregate economic effect." },
      { name: "United States v. Lopez", note: "First modern case to strike down a federal law as exceeding Commerce Clause power." },
      { name: "Youngstown Sheet & Tube Co. v. Sawyer", note: "Framework (via Jackson's concurrence) for analyzing executive power against congressional action." },
    ],
    studyStrategies: [
      "Build separate outlines for structural doctrine (federalism/separation of powers) and individual rights doctrine — they test very differently",
      "Track the historical arc of Commerce Clause doctrine explicitly; exam questions often ask you to apply competing eras of precedent",
      "Practice writing scrutiny analysis (rational basis / intermediate / strict) as a repeatable template you can drop into any fact pattern",
    ],
    commonChallenges: [
      "The historical sweep of the material (18th century to present) makes it easy to lose track of which doctrine is still good law",
      "Levels-of-scrutiny analysis is deceptively simple to state and easy to misapply under time pressure",
    ],
    resources: [
      "Examples & Explanations: Constitutional Law (Chemerinsky)",
      "Constitutional Law: Principles and Policies (Chemerinsky treatise, for deeper reference)",
      "CALI lessons on Commerce Clause and Equal Protection frameworks",
    ],
    summary:
      "A doctrine-heavy, historically-organized course. Success depends on tracking how the law shifted over time and having a repeatable analytical template for scrutiny questions.",
  },
  {
    id: "contracts",
    courseCode: "LAW 5402",
    creditHours: 4,
    year: "1L",
    title: "Contracts",
    overview:
      "Contracts covers the formation, interpretation, performance, and breach of legally enforceable agreements. It draws on both common law and the Uniform Commercial Code (UCC) Article 2 for the sale of goods.",
    purpose:
      "Contract law underlies nearly all commercial and personal transactions. It's also one of the best courses for learning rigorous rule-based legal analysis, since contract doctrine is built from clearly stated, testable elements.",
    learningObjectives: [
      "Identify offer, acceptance, and consideration in a transaction",
      "Determine whether the common law or the UCC governs a given contract",
      "Apply defenses to formation (mistake, misrepresentation, duress, unconscionability)",
      "Analyze whether a breach has occurred and what remedies are available",
      "Understand third-party rights (assignment, delegation, third-party beneficiaries)",
    ],
    majorTopics: [
      "Offer and acceptance (mirror image rule vs. UCC's more flexible approach)",
      "Consideration and promissory estoppel",
      "The Statute of Frauds",
      "Parol evidence rule and contract interpretation",
      "Conditions and material breach",
      "Excuse doctrines (impossibility, impracticability, frustration of purpose)",
      "Remedies (expectation, reliance, restitution damages; specific performance)",
      "Third-party beneficiaries, assignment, and delegation",
      "UCC Article 2 sale-of-goods rules",
    ],
    courseStructure:
      "Case-method heavy, frequently paired with UCC statutory provisions. Many professors teach formation first, then remedies, then move to defenses and third-party issues — but sequencing varies significantly by professor.",
    assessment:
      "Almost always a closed-book issue-spotting essay exam with a multi-party fact pattern requiring identification of every contract formed, breached, and excused, plus a damages calculation.",
    landmarkCases: [
      { name: "Hadley v. Baxendale", note: "Establishes the foreseeability limitation on consequential damages — one of the most heavily tested rules in all of Contracts." },
      { name: "Hawkins v. McGee", note: "The 'hairy hand' case; illustrates expectation damages." },
      { name: "Lucy v. Zehmer", note: "Objective theory of contract formation — intent is judged by outward manifestation, not secret intent." },
      { name: "Jacob & Youngs v. Kent", note: "Substantial performance doctrine in construction contracts." },
      { name: "Hoffman v. Red Owl Stores", note: "Leading promissory estoppel case." },
    ],
    studyStrategies: [
      "Build a single-page 'contract lifecycle' flowchart: formation → defenses → performance → breach → remedies, and practice slotting facts into each stage",
      "Hadley v. Baxendale-style foreseeability analysis shows up constantly — memorize the rule cold, not just the case name",
      "Practice full-length issue-spotters weekly in the last month; Contracts exams reward speed and completeness over depth on any one issue",
    ],
    commonChallenges: [
      "Determining whether the UCC or common law governs (and which rules differ between them) is a recurring, easy-to-miss issue",
      "Damages calculations under time pressure are a common source of lost points even when the doctrine is understood conceptually",
    ],
    resources: [
      "Examples & Explanations: Contracts (Blum)",
      "Contracts casebook problem sets (many professors assign UCC-based problems separately from the casebook)",
      "CALI lessons on consideration and the parol evidence rule",
    ],
    summary:
      "One of the most rule-dense 1L courses, and one where a clear formation-to-remedies framework pays off enormously on exams. Know Hadley cold.",
  },
  {
    id: "criminal-law",
    courseCode: "LAW 5310",
    creditHours: 3,
    year: "1L",
    title: "Criminal Law",
    overview:
      "Criminal Law covers the elements of criminal offenses, defenses, and the theoretical justifications for punishment. It draws on both common law doctrine and the Model Penal Code (MPC), and increasingly on Texas's own Penal Code given the school's location.",
    purpose:
      "Beyond direct relevance to prosecution and defense practice, Criminal Law is where many students first engage seriously with mens rea analysis — a mode of reasoning (matching mental state to conduct) that recurs throughout the law.",
    learningObjectives: [
      "Break an offense into its actus reus and mens rea elements",
      "Apply the Model Penal Code's mens rea hierarchy (purposely, knowingly, recklessly, negligently)",
      "Analyze homicide gradations (murder, manslaughter, and their subcategories)",
      "Apply defenses including self-defense, insanity, and duress",
      "Understand accomplice liability and inchoate offenses (attempt, conspiracy, solicitation)",
    ],
    majorTopics: [
      "Actus reus and the voluntary act requirement",
      "Mens rea (common law categories and the MPC's four-tier framework)",
      "Homicide (murder degrees, voluntary/involuntary manslaughter, felony murder)",
      "Defenses (self-defense, defense of others, insanity, intoxication, duress, necessity)",
      "Inchoate crimes (attempt, conspiracy, solicitation)",
      "Accomplice and accessory liability",
      "Rape and sexual assault doctrine",
      "Theft offenses and property crimes",
    ],
    courseStructure:
      "Case method combined with close statutory reading of the Model Penal Code and, often, the Texas Penal Code for comparative purposes given Texas Tech's location and bar relevance.",
    assessment:
      "Typically a closed-book issue-spotting exam requiring students to identify every possible charge against every actor in a fact pattern, along with applicable defenses.",
    landmarkCases: [
      { name: "Regina v. Dudley and Stephens", note: "Classic necessity-defense case involving survival cannibalism at sea; tests the limits of the necessity defense." },
      { name: "People v. Goetz", note: "Explores the reasonableness standard in self-defense." },
      { name: "M'Naghten's Case", note: "Origin of the traditional insanity defense test still referenced in modern doctrine." },
      { name: "Pinkerton v. United States", note: "Establishes co-conspirator liability for foreseeable crimes committed in furtherance of a conspiracy." },
    ],
    studyStrategies: [
      "Build an elements chart for every homicide grade side-by-side (murder / voluntary manslaughter / involuntary manslaughter / felony murder) — exams reward precise line-drawing between them",
      "Practice mens rea classification as a drill: given a fact pattern, identify purposely/knowingly/recklessly/negligently before anything else",
      "Because Texas Tech sits in Texas, pay attention to any Texas Penal Code comparisons your professor raises — they often signal bar-relevant distinctions",
    ],
    commonChallenges: [
      "Common law and MPC terminology sometimes conflict, and mixing them on an exam costs points",
      "Homicide gradation is one of the most commonly under-prepared topics because it requires memorizing several overlapping tests",
    ],
    resources: [
      "Examples & Explanations: Criminal Law (Singer & La Fond)",
      "Model Penal Code (official text — know Sections 210 and 2.02 well)",
      "CALI lessons on mens rea and homicide",
    ],
    summary:
      "A doctrine-heavy course rewarding precise elements-based analysis. Master the MPC mens rea hierarchy early — it's the backbone of nearly every issue in the course.",
  },
  {
    id: "legal-practice-1",
    courseCode: "LAW 5306",
    creditHours: 3,
    year: "1L",
    title: "Legal Practice I",
    overview:
      "The first semester of Texas Tech's signature year-long Legal Practice sequence — a skills-based course covering legal research, objective writing, and the foundations of professional legal communication.",
    purpose:
      "Doctrinal courses teach you what the law is; Legal Practice teaches you what to do with it. Texas Tech places heavy emphasis on this sequence specifically so students are prepared to work in a legal setting as early as the summer after 1L year.",
    learningObjectives: [
      "Conduct legal research using both primary and secondary sources",
      "Write an objective legal memorandum analyzing a client's legal problem",
      "Understand proper legal citation (Bluebook)",
      "Apply the IRAC/CRAC structure to written legal analysis",
      "Develop foundational professionalism and legal ethics awareness",
    ],
    majorTopics: [
      "Legal research methodology (case law, statutes, regulations, secondary sources)",
      "Reading and synthesizing multiple authorities into a single rule",
      "Objective memo writing (predictive analysis for a supervising attorney or client)",
      "Bluebook citation format",
      "Professional communication and email etiquette in legal practice",
    ],
    courseStructure:
      "Small-section, workshop-style class rather than large lecture. Heavy emphasis on drafts, feedback, and revision cycles rather than a single cumulative exam.",
    assessment:
      "Graded primarily on written work product (research memos, citation exercises) rather than a timed exam. Multiple smaller assignments building toward one larger memo.",
    landmarkCases: [],
    studyStrategies: [
      "Treat every draft as a real work product, not a school assignment — the habits you build here directly determine how you'll be evaluated as a summer associate or clerk",
      "Read your professor's comments on every draft closely; legal writing improves through iteration far more than through reading about writing",
      "Start research assignments early — legal research databases have a real learning curve that punishes procrastination",
    ],
    commonChallenges: [
      "Students often under-invest in this course because it doesn't feel as 'academic' as doctrinal classes, then struggle when summer employers expect polished writing",
      "The shift from academic writing (essays) to legal writing (objective, structured, citation-heavy) is a bigger adjustment than expected",
    ],
    resources: [
      "The Bluebook: A Uniform System of Citation",
      "Legal Writing in Plain English (Garner)",
      "Texas Tech's Legal Practice program materials and research guides",
    ],
    summary:
      "The most immediately practical course of your 1L year. The research and writing skills built here are what employers actually evaluate in interviews and summer positions.",
  },
  {
    id: "legal-practice-2",
    courseCode: "LAW 5307",
    creditHours: 3,
    year: "1L",
    title: "Legal Practice II",
    overview:
      "The second half of the year-long Legal Practice sequence, shifting from objective memo writing to persuasive writing, oral advocacy, client interviewing, counseling, and alternative dispute resolution.",
    purpose:
      "Where Legal Practice I builds analytical writing skills, Legal Practice II builds advocacy and interpersonal lawyering skills — the abilities needed to argue a position and work directly with clients.",
    learningObjectives: [
      "Draft a persuasive legal brief advocating for a specific outcome",
      "Deliver oral argument responding to questions under pressure",
      "Conduct a client interview and translate client goals into legal strategy",
      "Understand the basics of negotiation and alternative dispute resolution",
      "Apply professional responsibility principles in simulated practice settings",
    ],
    majorTopics: [
      "Persuasive brief writing (theory of the case, argument structure, addressing counterarguments)",
      "Oral advocacy and moot court-style argument",
      "Client interviewing and counseling technique",
      "Negotiation fundamentals and alternative dispute resolution (ADR)",
      "Professionalism and legal ethics in client-facing contexts",
    ],
    courseStructure:
      "Continues the small-section, workshop format from Legal Practice I, but adds live oral argument exercises and simulated client interviews, often judged or observed by faculty and practicing attorneys.",
    assessment:
      "Graded on a persuasive brief, an oral argument performance, and often a client interview simulation — a mix of written and performance-based assessment rather than a single exam.",
    landmarkCases: [],
    studyStrategies: [
      "Practice your oral argument out loud, multiple times, well before the actual exercise — reading your notes silently does not prepare you for live questioning",
      "In persuasive writing, resist the urge to just restate Legal Practice I's objective analysis with stronger adjectives; persuasive writing requires actual argument structure",
      "Record yourself doing a mock client interview and watch it back — most students are surprised by their own filler words and interruptions",
    ],
    commonChallenges: [
      "Oral argument is genuinely uncomfortable for most first-year students; the anxiety is normal and improves quickly with repetition",
      "Persuasive writing requires suppressing the instinct (built in Legal Practice I) to present both sides evenhandedly",
    ],
    resources: [
      "Point Made: How to Write Like the Nation's Top Advocates (Ross Guberman)",
      "Board of Barristers practice sessions and competition materials (see Part III)",
      "Texas Tech Legal Practice program oral argument guides",
    ],
    summary:
      "Builds the advocacy skills that carry directly into moot court, negotiation competitions, and client-facing summer work. The discomfort of oral argument fades fast with practice — lean into it early.",
  },
  {
    id: "property",
    courseCode: "LAW 5403",
    creditHours: 3,
    year: "1L",
    title: "Property",
    overview:
      "Property covers the rules governing ownership, possession, and transfer of real and personal property — from the theoretical basis of ownership through landlord-tenant law, estates, easements, and land-use regulation.",
    purpose:
      "Property law underlies real estate transactions, land use, and a significant share of civil litigation. It's also one of the more historically dense 1L courses, tracing doctrine back through English common law.",
    learningObjectives: [
      "Understand the bundle-of-rights theory of property ownership",
      "Distinguish among possessory estates (fee simple, life estate, defeasible fees) and future interests",
      "Apply the rules governing concurrent ownership (joint tenancy, tenancy in common)",
      "Analyze landlord-tenant disputes under both common law and modern statutory frameworks",
      "Understand easements, covenants, and land-use restrictions",
    ],
    majorTopics: [
      "Acquisition of property (capture, discovery, adverse possession, gifts)",
      "Estates in land (fee simple, life estates, defeasible estates)",
      "Future interests (reversions, remainders, executory interests, the Rule Against Perpetuities)",
      "Concurrent ownership (joint tenancy, tenancy in common, tenancy by the entirety)",
      "Landlord-tenant law (leaseholds, habitability, eviction)",
      "Easements, covenants, and servitudes",
      "Zoning and land-use regulation",
      "The recording system and bona fide purchasers",
    ],
    courseStructure:
      "Heavily case-and-doctrine driven, often organized historically from common-law estates through modern statutory overlays. Expect some of the oldest and most linguistically dense opinions of your 1L year.",
    assessment:
      "Typically a closed-book issue-spotting exam covering multiple doctrinal areas (e.g., a fact pattern touching adverse possession, an easement dispute, and a landlord-tenant issue in the same question).",
    landmarkCases: [
      { name: "Pierson v. Post", note: "Foundational 'rule of capture' case on acquiring property rights in wild animals; a classic first-week Property case." },
      { name: "Johnson v. M'Intosh", note: "Explores the doctrine of discovery and its troubling role in early American property law." },
      { name: "Armory v. Delamirie", note: "Establishes finder's rights against all but the true owner." },
      { name: "Sawada v. Endo", note: "Illustrates tenancy by the entirety and its protection from individual creditors." },
    ],
    studyStrategies: [
      "Draw the future interests system out visually (a timeline of who holds what, when) — this is one topic where diagrams outperform prose every time",
      "Build a checklist for adverse possession elements (actual, open, notorious, exclusive, hostile, continuous) and drill it until automatic",
      "Property exams often blend multiple sub-doctrines in one fact pattern — practice identifying every distinct issue before writing a single sentence of analysis",
    ],
    commonChallenges: [
      "Future interests terminology is dense and easy to confuse (remainder vs. executory interest, vested vs. contingent)",
      "The historical, feudal-law origins of estate doctrine feel disconnected from modern practice, which makes the material harder to anchor in memory",
    ],
    resources: [
      "Examples & Explanations: Property (Sprankling)",
      "The Glannon Guide to Property",
      "CALI lessons on future interests and the Rule Against Perpetuities",
    ],
    summary:
      "Historically dense but highly systematic once you build the right visual frameworks — especially for future interests. Diagram everything.",
  },
  {
    id: "torts",
    courseCode: "LAW 5404",
    creditHours: 4,
    year: "1L",
    title: "Torts",
    overview:
      "Torts covers civil wrongs — negligence, intentional torts, and strict liability — and the remedies available to injured parties. It's often considered the most narratively engaging 1L course because the fact patterns involve real accidents, injuries, and disputes.",
    purpose:
      "Torts underlies personal injury practice, insurance defense, and a huge share of civil litigation generally. It's also where many students first engage with policy-driven doctrine, since tort rules are explicitly shaped by competing views of fairness and deterrence.",
    learningObjectives: [
      "Apply the elements of negligence (duty, breach, causation, damages)",
      "Distinguish intentional torts (battery, assault, false imprisonment, IIED) from negligence",
      "Understand strict liability doctrine and when it applies",
      "Apply defenses including contributory/comparative negligence and assumption of risk",
      "Understand proximate cause and its limits on liability",
    ],
    majorTopics: [
      "Intentional torts (battery, assault, false imprisonment, trespass, intentional infliction of emotional distress)",
      "Negligence (duty, breach/standard of care, actual causation, proximate causation, damages)",
      "Defenses to negligence (contributory negligence, comparative fault, assumption of risk)",
      "Strict liability (abnormally dangerous activities, products liability)",
      "Vicarious liability and joint and several liability",
      "Defamation and privacy torts",
      "Damages (compensatory, punitive)",
    ],
    courseStructure:
      "Case-heavy with a strong policy-analysis component; professors frequently ask 'why should this rule exist?' alongside 'what is this rule?' Often organized intentional torts → negligence → strict liability → specialized torts.",
    assessment:
      "Almost always a closed-book, multi-party issue-spotting exam. Fact patterns commonly involve several potential plaintiffs, defendants, and overlapping tort theories in a single scenario.",
    landmarkCases: [
      { name: "Palsgraf v. Long Island Railroad Co.", note: "The single most famous Torts case; frames the entire proximate cause debate around foreseeability of the plaintiff (Cardozo) versus foreseeability of harm generally (Andrews' dissent)." },
      { name: "Vosburg v. Putney", note: "Establishes that intent to make contact — not intent to harm — satisfies battery's intent element." },
      { name: "United States v. Carroll Towing Co.", note: "Learned Hand's algebraic formula (B < PL) for the negligence standard of care." },
      { name: "MacPherson v. Buick Motor Co.", note: "Extends manufacturer liability beyond direct purchasers, foundational to modern products liability." },
      { name: "Greenman v. Yuba Power Products", note: "Establishes strict products liability in tort." },
    ],
    studyStrategies: [
      "Palsgraf shows up in some form on nearly every Torts exam — know both Cardozo's majority and Andrews' dissent well enough to argue either side",
      "Build a negligence checklist (duty → breach → actual cause → proximate cause → damages) and practice running every fact pattern through all five elements, even when one seems obviously satisfied",
      "Keep a running list of every tort's elements on one reference sheet — with 10+ distinct torts, cross-tort confusion is the most common source of lost exam points",
    ],
    commonChallenges: [
      "Distinguishing actual (but-for) causation from proximate cause is a persistent point of confusion",
      "With so many overlapping doctrines, students often argue the wrong tort convincingly rather than correctly identifying which tort actually fits the facts",
    ],
    resources: [
      "Examples & Explanations: Torts (Franklin, Rabin, Green)",
      "The Glannon Guide to Torts",
      "CALI lessons on negligence and proximate cause",
    ],
    summary:
      "Fact-driven and policy-rich. Palsgraf is the intellectual center of gravity for the whole course — understand it deeply, not just as a case name to cite.",
  },
];

export const UPPER_LEVEL_COURSES: CourseChapter[] = [
  {
    id: "business-entities",
    courseCode: "LAW 6435",
    creditHours: 4,
    year: "Upper-Level",
    title: "Business Entities",
    overview:
      "Covers the formation, governance, and dissolution of business organizations — partnerships, LLCs, and corporations — along with the fiduciary duties owners and managers owe to each other and to the entity.",
    purpose:
      "Nearly every transactional practice area touches business entity law. It's also required for bar exam purposes in most jurisdictions, including Texas.",
    learningObjectives: [
      "Compare entity types (sole proprietorship, general/limited partnership, LLC, corporation) and their liability implications",
      "Understand corporate governance structures (boards, officers, shareholders)",
      "Apply fiduciary duty doctrine (duty of care, duty of loyalty) and the business judgment rule",
      "Understand piercing the corporate veil",
      "Analyze mergers, acquisitions, and dissolution basics",
    ],
    majorTopics: [
      "Entity selection and formation (partnerships, LLCs, corporations)",
      "Agency law fundamentals underlying entity liability",
      "Corporate governance (board authority, shareholder rights, derivative suits)",
      "Fiduciary duties and the business judgment rule",
      "Piercing the corporate veil",
      "Securities law basics as applied to closely-held entities",
    ],
    courseStructure:
      "Combines case law with heavy statutory work (state corporate codes, the Revised Uniform Partnership Act, LLC statutes). Often includes transactional drafting exercises alongside traditional case analysis.",
    assessment:
      "Typically a closed- or open-book issue-spotting exam; some sections include a drafting component (e.g., analyzing or drafting entity governance provisions).",
    landmarkCases: [
      { name: "Meinhard v. Salmon", note: "Cardozo's famous articulation of the fiduciary duty of loyalty among co-venturers — 'a punctilio of an honor the most sensitive.'" },
      { name: "Smith v. Van Gorkom", note: "Landmark business judgment rule case on board process and gross negligence." },
      { name: "Walkovszky v. Carlton", note: "Leading piercing-the-corporate-veil case." },
    ],
    studyStrategies: [
      "Build a comparison chart of entity types across formation requirements, liability exposure, management structure, and tax treatment — this single chart answers most exam questions",
      "The business judgment rule is deferential by design; practice explaining why courts defer rather than just stating the rule",
      "Work through piercing-the-corporate-veil factors as an explicit checklist rather than a vague 'unfairness' judgment call",
    ],
    commonChallenges: [
      "Students often confuse fiduciary duties owed in different entity contexts (corporate officers vs. partners vs. LLC managers)",
      "Statutory cross-referencing (state corporate code sections) is more central to this course than most students expect coming from case-heavy 1L courses",
    ],
    resources: [
      "Examples & Explanations: Corporations (Klein, Ramseyer, Bainbridge)",
      "Model Business Corporation Act (reference text)",
      "Texas Business Organizations Code (relevant given TTU's location)",
    ],
    summary:
      "A statute-heavy, practice-relevant course. A clean entity-comparison chart and a solid grip on fiduciary duty doctrine carry most of the exam.",
  },
  {
    id: "commercial-law",
    courseCode: "LAW 6420",
    creditHours: 4,
    year: "Upper-Level",
    title: "Commercial Law",
    overview:
      "Covers secured transactions and negotiable instruments under the Uniform Commercial Code — how creditors secure interests in personal property collateral, and how commercial paper (checks, notes) functions as a payment and credit system.",
    purpose:
      "A required, bar-tested subject central to lending, banking, and commercial transactional practice. Builds directly on the UCC foundation introduced in 1L Contracts.",
    learningObjectives: [
      "Understand how a security interest is created (attachment) and made effective against third parties (perfection)",
      "Apply priority rules among competing secured creditors",
      "Understand default and remedies available to secured parties",
      "Analyze negotiable instruments and holder-in-due-course status",
      "Understand the basics of letters of credit and payment systems",
    ],
    majorTopics: [
      "Attachment and perfection of security interests (UCC Article 9)",
      "Priority disputes among secured creditors and purchase-money security interests",
      "Default, repossession, and disposition of collateral",
      "Negotiable instruments (UCC Article 3) and holder-in-due-course doctrine",
      "Bank deposits and collections (UCC Article 4)",
    ],
    courseStructure:
      "Almost entirely statutory — expect to spend more time reading and applying UCC provisions directly than reading judicial opinions, a shift from the case-method-heavy 1L year.",
    assessment:
      "Typically a closed-book exam with transactional fact patterns (e.g., competing creditor priority disputes) requiring precise statutory citation and application.",
    landmarkCases: [
      { name: "In re Trigg", note: "Frequently used to illustrate perfection and priority disputes in secured transactions." },
    ],
    studyStrategies: [
      "Treat the UCC like a rulebook, not a narrative — build a step-by-step checklist for attachment, then a separate one for perfection, then a separate one for priority",
      "Practice priority disputes as a repeatable algorithm: identify all claimants, determine perfection status and timing for each, then apply the relevant priority rule",
      "Keep the UCC text itself open while studying — precise section citation matters more here than in most other courses",
    ],
    commonChallenges: [
      "The shift from case analysis to pure statutory application is a genuine adjustment, even for strong 1L students",
      "Priority rules have many exceptions (PMSI super-priority, buyers in the ordinary course) that are easy to overlook under time pressure",
    ],
    resources: [
      "Examples & Explanations: Secured Transactions (LoPucki, Warren)",
      "UCC Articles 3, 4, and 9 (reference text)",
      "CALI lessons on attachment and perfection",
    ],
    summary:
      "A statute-driven course that rewards methodical, checklist-based analysis over narrative reasoning. Build your priority-dispute algorithm early and practice it repeatedly.",
  },
  {
    id: "criminal-procedure",
    courseCode: "LAW 6339",
    creditHours: 3,
    year: "Upper-Level",
    title: "Criminal Procedure",
    overview:
      "Covers the constitutional rules governing police investigation and the criminal trial process — primarily Fourth, Fifth, and Sixth Amendment doctrine as applied to searches, interrogations, and the right to counsel.",
    purpose:
      "Essential for prosecution, defense, and any litigation touching constitutional criminal rights. Builds on the substantive criminal law foundation from 1L year with a procedural, rights-based lens.",
    learningObjectives: [
      "Determine when a Fourth Amendment search or seizure has occurred and whether it was reasonable",
      "Apply the exceptions to the warrant requirement",
      "Understand Miranda doctrine and the Fifth Amendment privilege against self-incrimination",
      "Apply the Sixth Amendment right to counsel across different stages of a criminal proceeding",
      "Understand the exclusionary rule and its exceptions",
    ],
    majorTopics: [
      "Fourth Amendment search and seizure (reasonable expectation of privacy, probable cause)",
      "Warrant exceptions (search incident to arrest, automobile exception, exigent circumstances, consent)",
      "Stop and frisk doctrine",
      "Fifth Amendment self-incrimination and Miranda doctrine",
      "Sixth Amendment right to counsel",
      "The exclusionary rule and the fruit-of-the-poisonous-tree doctrine",
    ],
    courseStructure:
      "Almost entirely Supreme Court case method, organized around the sequence of a criminal investigation — from initial police contact through interrogation to trial-stage rights.",
    assessment:
      "Typically a closed-book issue-spotting exam involving a step-by-step police investigation fact pattern requiring analysis of each constitutional checkpoint.",
    landmarkCases: [
      { name: "Katz v. United States", note: "Establishes the 'reasonable expectation of privacy' test defining what counts as a Fourth Amendment search." },
      { name: "Terry v. Ohio", note: "Establishes the stop-and-frisk 'reasonable suspicion' standard." },
      { name: "Miranda v. Arizona", note: "Requires warnings before custodial interrogation to protect the Fifth Amendment privilege." },
      { name: "Gideon v. Wainwright", note: "Establishes the Sixth Amendment right to appointed counsel for indigent defendants in felony cases." },
      { name: "Mapp v. Ohio", note: "Applies the exclusionary rule to the states via the Fourteenth Amendment." },
    ],
    studyStrategies: [
      "Build a chronological checklist mirroring an actual police encounter (stop → search → arrest → interrogation → counsel) and practice slotting doctrine into each stage",
      "Miranda and the Sixth Amendment right to counsel are frequently confused — build a comparison chart of when each attaches and what triggers it",
      "Practice identifying every warrant exception by name and elements; exam fact patterns often hinge on which single exception applies",
    ],
    commonChallenges: [
      "The overlapping timing of Fourth, Fifth, and Sixth Amendment protections (which attach at different stages) is a common source of confusion",
      "Students sometimes over-apply Miranda to non-custodial or non-interrogation settings where it doesn't actually apply",
    ],
    resources: [
      "Examples & Explanations: Criminal Procedure (Israel, Kamisar, LaFave)",
      "CALI lessons on the Fourth Amendment and Miranda doctrine",
    ],
    summary:
      "A Supreme Court case-method course best mastered by building a chronological framework mirroring the actual stages of a criminal investigation.",
  },
  {
    id: "evidence",
    courseCode: "LAW 6416",
    creditHours: 4,
    year: "Upper-Level",
    title: "Evidence",
    overview:
      "Covers the rules governing what information can be presented at trial — relevance, hearsay, witness competency, privileges, and expert testimony — primarily through the Federal Rules of Evidence.",
    purpose:
      "Essential for any litigation practice. Evidence is also one of the most immediately practical upper-level courses, since trial lawyers apply these rules in real time.",
    learningObjectives: [
      "Apply the relevance standard and its exceptions (Rule 403 balancing)",
      "Identify hearsay and apply the exclusions and exceptions",
      "Understand character evidence rules and their exceptions",
      "Apply the rules governing expert witness testimony",
      "Understand privilege doctrine (attorney-client, spousal, etc.)",
    ],
    majorTopics: [
      "Relevance and Rule 403 balancing (probative value vs. prejudice)",
      "Hearsay definition, exclusions, and the major exceptions (present sense impression, excited utterance, business records, statements against interest)",
      "Character evidence and impeachment",
      "Authentication and the best evidence rule",
      "Expert testimony (Daubert standard)",
      "Privileges (attorney-client, work product, spousal)",
    ],
    courseStructure:
      "Rule-by-rule statutory analysis of the Federal Rules of Evidence, paired with cases interpreting each rule. Many sections include simulated objection exercises or mock evidentiary hearings.",
    assessment:
      "Often a mix of a traditional exam and an objection-based practical exercise (e.g., 'is this objection sustained or overruled, and why') testing real-time rule application.",
    landmarkCases: [
      { name: "Daubert v. Merrell Dow Pharmaceuticals", note: "Establishes the modern standard for admissibility of expert scientific testimony." },
      { name: "Old Chief v. United States", note: "Explores Rule 403 balancing in the context of stipulating to avoid prejudicial evidence." },
      { name: "Crawford v. Washington", note: "Reshapes the Confrontation Clause's interaction with hearsay exceptions for testimonial statements." },
    ],
    studyStrategies: [
      "Build a hearsay flowchart: is it a statement? Is it offered for the truth of the matter asserted? If yes to both, does an exclusion or exception apply?",
      "Practice making and responding to objections out loud — Evidence is one of the few courses where verbal fluency under time pressure is directly tested in practice",
      "Keep the Federal Rules of Evidence numbered and organized on a single reference sheet; professors expect precise rule citation (e.g., '803(6)' not just 'business records exception')",
    ],
    commonChallenges: [
      "Hearsay exceptions have many overlapping, similarly-worded requirements that are easy to confuse under pressure",
      "Students often struggle with the practical, real-time application format if their program emphasizes essay exams over oral exercises elsewhere",
    ],
    resources: [
      "Examples & Explanations: Evidence (Rothstein, Raeder, Crump)",
      "Federal Rules of Evidence (reference text — know the numbering)",
      "Board of Barristers mock trial materials for practical objection practice",
    ],
    summary:
      "One of the most practice-relevant courses in the curriculum. A clean hearsay flowchart and comfort with real-time objection practice are the two highest-leverage investments.",
  },
  {
    id: "income-taxation",
    courseCode: "LAW 6434",
    creditHours: 4,
    year: "Upper-Level",
    title: "Income Taxation",
    overview:
      "An introduction to federal individual income tax law — what counts as income, what can be deducted, and how the timing and character of transactions affect tax treatment.",
    purpose:
      "Tax touches nearly every transactional and estate planning practice area, and income taxation is a bar-tested subject in many jurisdictions. It also teaches close statutory reading skills that transfer to any regulation-heavy practice.",
    learningObjectives: [
      "Determine what constitutes gross income under Section 61 and its exclusions",
      "Understand the rules governing deductions and their limitations",
      "Analyze the tax treatment of property transactions (basis, gain, loss)",
      "Understand the difference between capital gains and ordinary income",
      "Apply timing doctrines (realization, recognition, accounting methods)",
    ],
    majorTopics: [
      "Gross income and statutory exclusions (gifts, inheritances, fringe benefits)",
      "Deductions (above-the-line, itemized, and their limitations)",
      "Property transactions (basis, realization, recognition of gain or loss)",
      "Capital gains vs. ordinary income characterization",
      "Timing doctrines and accounting methods",
      "Tax treatment of debt and its cancellation",
    ],
    courseStructure:
      "Statute-and-regulation-driven, centered on the Internal Revenue Code. Expect close, line-by-line statutory reading similar in style to Commercial Law but with denser cross-referencing.",
    assessment:
      "Typically a closed-book exam with computational and analytical components — calculating tax consequences of a series of transactions, not just identifying issues conceptually.",
    landmarkCases: [
      { name: "Commissioner v. Glenshaw Glass Co.", note: "Establishes the broad definition of gross income as 'undeniable accessions to wealth.'" },
      { name: "Eisner v. Macomber", note: "Early foundational case on the realization requirement." },
    ],
    studyStrategies: [
      "Build a step-by-step computation template (gross income → adjustments → deductions → taxable income → tax liability) and practice running numeric problems through it repeatedly",
      "Tax rewards comfort with basic arithmetic under pressure as much as doctrinal knowledge — don't neglect computational practice in favor of pure reading",
      "Keep the Internal Revenue Code sections organized by topic on a reference sheet; like Commercial Law, precise section citation matters",
    ],
    commonChallenges: [
      "The shift to genuinely computational exam questions surprises students used to purely narrative issue-spotting",
      "The sheer density of statutory cross-references (a single question can implicate five or six Code sections) makes time management difficult",
    ],
    resources: [
      "Examples & Explanations: Federal Income Tax (Burke)",
      "Federal Income Tax: A Contemporary Approach (commonly assigned casebook)",
      "Internal Revenue Code (reference text — annotated editions are worth the cost)",
    ],
    summary:
      "The most computationally demanding upper-level course in the required curriculum. Build and drill a repeatable calculation template well before exam week.",
  },
  {
    id: "wills-and-trusts",
    courseCode: "LAW 6415",
    creditHours: 4,
    year: "Upper-Level",
    title: "Wills and Trusts",
    overview:
      "Covers the law of intestate succession, will execution and validity, trust creation and administration, and the rules governing the transfer of wealth at death.",
    purpose:
      "Central to estate planning practice and a bar-tested subject. Texas Tech's proximity to and emphasis on Texas practice makes this course especially relevant given Texas's distinct community property system.",
    learningObjectives: [
      "Apply intestate succession rules when a decedent dies without a valid will",
      "Determine the formal requirements for a valid will and grounds for contesting one",
      "Understand the creation, modification, and termination of trusts",
      "Apply fiduciary duties owed by trustees and personal representatives",
      "Understand how Texas's community property system affects estate planning",
    ],
    majorTopics: [
      "Intestate succession and the rules of descent and distribution",
      "Will execution formalities and will contests (capacity, undue influence, fraud)",
      "Revocation and revival of wills",
      "Trust creation, the trustee's fiduciary duties, and trust administration",
      "Powers of appointment",
      "Community property basics as applied to estate planning (particularly relevant in Texas)",
    ],
    courseStructure:
      "Blends case law with heavy statutory reference to the Texas Estates Code and Uniform Probate Code concepts, plus drafting exercises for wills and trust instruments in many sections.",
    assessment:
      "Typically a closed-book issue-spotting exam covering a family's estate planning scenario, often combined with a drafting or document-review component.",
    landmarkCases: [
      { name: "In re Estate of Cutsinger / analogous will-contest cases", note: "Illustrative of undue influence analysis in will contests (specific assigned cases vary by professor)." },
    ],
    studyStrategies: [
      "Build a decision tree for a decedent's estate: valid will? → intestate succession rules → community vs. separate property characterization → distribution",
      "Because Texas has its own community property and probate rules distinct from many other states, keep a dedicated 'Texas-specific rule' section in your outline separate from general/majority-rule doctrine",
      "Practice drafting simple will and trust provisions, not just analyzing them — many sections test drafting ability directly",
    ],
    commonChallenges: [
      "Community property doctrine is unfamiliar to students without a Texas or community-property-state background and requires deliberate extra study time",
      "Will contest doctrine (capacity, undue influence, fraud) involves fact-intensive, multi-factor tests that are easy to state vaguely but hard to apply precisely",
    ],
    resources: [
      "Examples & Explanations: Wills, Trusts, and Estates (Sitkoff)",
      "Texas Estates Code (reference text, especially relevant to TTU's location)",
      "Uniform Probate Code (for comparative/majority-rule context)",
    ],
    summary:
      "A practice-relevant course with a distinctly Texas flavor given the state's community property system. Keep Texas-specific rules clearly separated from general doctrine in your outline.",
  },
  {
    id: "professional-responsibility",
    courseCode: "LAW 6357",
    creditHours: 3,
    year: "Upper-Level",
    title: "Professional Responsibility",
    overview:
      "Covers the rules of professional conduct governing lawyers — conflicts of interest, confidentiality, competence, and the lawyer's duties to clients, courts, and third parties. Required for the bar's separate Multistate Professional Responsibility Examination (MPRE) preparation as well as graduation.",
    purpose:
      "Every practicing lawyer is bound by rules of professional conduct, and violations carry real professional and disciplinary consequences. This course also directly prepares students for the MPRE, a separate licensing requirement from the bar exam itself.",
    learningObjectives: [
      "Apply the duty of confidentiality and its exceptions",
      "Identify and analyze conflicts of interest (current client, former client, and personal conflicts)",
      "Understand the duty of competence and diligence",
      "Apply the rules governing attorney advertising and solicitation",
      "Understand a lawyer's duties as an officer of the court (candor, fairness to opposing parties)",
    ],
    majorTopics: [
      "The attorney-client relationship and its formation",
      "Confidentiality and the attorney-client privilege (related but distinct concepts)",
      "Conflicts of interest (concurrent, successive, and personal-interest conflicts)",
      "Competence, diligence, and communication duties",
      "Duties to the court (candor, meritorious claims, fairness in litigation)",
      "Attorney advertising, solicitation, and fee arrangements",
      "Attorney discipline and malpractice liability",
    ],
    courseStructure:
      "Organized around the ABA Model Rules of Professional Conduct, taught through both hypothetical scenarios and real disciplinary case law. Frequently includes MPRE-style multiple-choice practice given the overlapping exam content.",
    assessment:
      "Often a mix of a traditional exam and MPRE-style multiple-choice questions, since the course content directly overlaps with that separate licensing exam.",
    landmarkCases: [
      { name: "Meyerhofer v. Empire Fire and Marine Insurance Co.", note: "Illustrative of confidentiality limits when a lawyer must defend against client allegations." },
    ],
    studyStrategies: [
      "Study this course with MPRE prep materials in parallel, even before your actual MPRE sitting — the overlap is substantial and the extra practice questions reinforce both",
      "Build a conflicts-of-interest checklist (current client vs. current client, current vs. former client, lawyer's personal interest) since conflicts questions are the most heavily tested category",
      "Don't confuse the attorney-client privilege (an evidentiary rule) with the ethical duty of confidentiality (a broader professional conduct rule) — they overlap but aren't identical, and exams test the distinction",
    ],
    commonChallenges: [
      "Because the rules feel intuitive ('don't have conflicts of interest'), students sometimes under-study the precise textual requirements and lose points on technical application",
      "The overlap and distinction between the privilege and the duty of confidentiality trips up even strong students",
    ],
    resources: [
      "ABA Model Rules of Professional Conduct (reference text)",
      "MPRE-specific prep materials (Themis, Barbri, or similar) used alongside coursework",
      "Examples & Explanations: Professional Responsibility (Gillers)",
    ],
    summary:
      "Directly overlaps with MPRE licensing content, so treat this course as dual-purpose. A precise conflicts-of-interest checklist and a clear confidentiality-vs.-privilege distinction cover most of what's tested.",
  },
];

export const ALL_COURSES: CourseChapter[] = [...FIRST_YEAR_COURSES, ...UPPER_LEVEL_COURSES];

// ── Part I — Before You Start Law School ──────────────────────────────────

export interface InfoSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const PART_I_SECTIONS: InfoSection[] = [
  {
    id: "ttu-overview",
    title: "Texas Tech School of Law Overview",
    paragraphs: [
      "Texas Tech University School of Law is an ABA-accredited law school in Lubbock, Texas, known for a practice-oriented curriculum and strong bar passage and employment outcomes relative to its size. Class sizes are relatively small, which means faculty know their students by name and cold calls are a real, regular part of the classroom experience — not an occasional event.",
      "The school places unusual emphasis on skills training from day one: the year-long Legal Practice sequence (Legal Practice I and II) is a required, six-credit-hour commitment across your entire 1L year, on top of the standard doctrinal courseload. Employment outcomes back up that emphasis — 96.95% of the Class of 2024 secured full-time, long-term positions within ten months of graduation, with private-sector starters earning a median salary of $82,400.",
    ],
  },
  {
    id: "curriculum-structure",
    title: "Understanding the Curriculum",
    paragraphs: [
      "The Texas Tech J.D. requires a minimum of 90 semester credit hours to graduate: 56 required hours and 34 elective hours. Of the required hours, 30 credits come during the 1L year (nine required courses, including the two-semester Legal Practice sequence), and 26 credits come from upper-level required courses spread across the 2L and 3L years — with 14 of those 26 hours specifically required during the second year.",
      "Beyond coursework, graduation requires a cumulative GPA of at least 2.000, completion of an advanced (upper-level) research and writing requirement, an advanced skills course requirement, at least 6 credits of experiential coursework, and 30 hours of pro bono or community service work. You have between 24 and 84 months to complete the degree under ABA timing rules — in practice, nearly everyone finishes in the standard three years.",
    ],
    bullets: [
      "90 total credit hours (56 required + 34 elective)",
      "2.000 minimum cumulative GPA",
      "Upper-level writing requirement + advanced skills course requirement",
      "6 credits of experiential coursework",
      "30 hours of pro bono / community service",
    ],
  },
  {
    id: "how-law-school-works",
    title: "How Law School Works",
    paragraphs: [
      "Most 1L classes are taught using the Socratic method: rather than lecturing, professors call on students (often without warning) and walk them through a case via questioning. The goal isn't to embarrass anyone — it's to force active engagement with the reasoning in a case rather than passive absorption of a rule. Expect to be called on. Expect to sometimes not have a perfect answer. That's normal, and it's part of how the method is designed to work.",
      "Grading in most 1L courses is curved and based overwhelmingly — often entirely — on a single final exam per course. There's usually no partial credit for 'knowing the material' if it doesn't show up in your exam answer; issue-spotting essay exams reward students who can identify every relevant issue in a fact pattern and apply the correct rule to each one, under real time pressure.",
    ],
  },
  {
    id: "thinking-like-a-lawyer",
    title: "Thinking Like a Lawyer",
    paragraphs: [
      "The phrase gets repeated so often it becomes a cliché, but it describes something concrete: breaking a fact pattern down into discrete legal issues, identifying the rule that governs each issue, applying that rule to the specific facts in front of you, and reaching a reasoned conclusion. This is the IRAC (Issue, Rule, Application, Conclusion) structure — and while it sounds mechanical, it's the single most reliable framework for both exam answers and real legal analysis.",
      "The habit that separates strong 1L students from struggling ones isn't raw intelligence — it's the discipline to spot every issue in a fact pattern rather than just the obvious one, and to apply rules to facts explicitly rather than asserting conclusions.",
    ],
  },
  {
    id: "academic-success-strategies",
    title: "Academic Success Strategies",
    paragraphs: [
      "Three habits consistently separate strong performers from the rest: briefing every case before class (even once you can skim efficiently), building your own outline from scratch rather than relying entirely on someone else's, and practicing full timed exams under real conditions well before the actual exam period.",
      "Texas Tech's Office of Academic Success Programs (OASP), led by Director Erica M. Lux, exists specifically to support this — offering one-on-one academic strategy sessions, weekly small-group tutoring led by trained upper-level students, drop-in office hours, and workshops throughout the year. Use it early, not just when you're already struggling.",
    ],
    bullets: [
      "Brief every case before class, even when it feels redundant",
      "Build your own outline — the act of writing it is what builds retention, not just having a finished document",
      "Take full timed practice exams under real conditions before the actual exam period",
      "Use OASP resources proactively, not reactively",
    ],
  },
];

// ── Part III — Texas Tech Opportunities ───────────────────────────────────

export const PART_III_SECTIONS: InfoSection[] = [
  {
    id: "clinics",
    title: "Clinics",
    paragraphs: [
      "Texas Tech offers a genuinely broad clinical program, letting students represent real clients under faculty supervision well before graduation. These are some of the most practically valuable credits you can earn in law school.",
    ],
    bullets: [
      "Civil Practice Clinic — handles a wide range of civil matters",
      "Criminal Defense Clinic — represents clients in state criminal courts",
      "Caprock Regional Public Defender Clinic",
      "Capital Punishment Clinic",
      "Innocence Clinic — post-conviction proceedings to establish actual innocence",
      "Tax Clinic — represents taxpayers in disputes with the IRS",
      "Family Law and Housing Clinic — cases from Legal Aid of NorthWest Texas",
      "Alternative Dispute Resolution Clinic (open to second-year students) — mediation and non-litigation dispute resolution",
    ],
  },
  {
    id: "externships",
    title: "Externships",
    paragraphs: [
      "The Regional Externship Program allows select third-year students to spend a full semester living in Dallas/Fort Worth or Austin, taking classes remotely while externing full-time with practicing attorneys or judges. The program provides twelve credit hours total: ten for completing 500 hours at the externship placement, plus two for the accompanying Regional Externship Support Course.",
      "Past placements have included the City of Austin Legal Department, the Texas Railroad Commission, Legal Aid of Northwest Texas, and in-house positions such as 7-Eleven Corporation's legal department.",
    ],
  },
  {
    id: "moot-court",
    title: "Moot Court and Advocacy Competitions",
    paragraphs: [
      "The Board of Barristers — a student organization run by top 3L students — organizes and judges eight intra-school advocacy competitions each year, spanning negotiation, mock trial, and moot court formats. Every 2L student participates in the Advanced Moot Court competition: students receive a case scenario and have roughly a month to prepare before the first round.",
      "These competitions are where the oral advocacy skills built in Legal Practice II get real stress-tested — and they're a strong resume credential for litigation-track students regardless of whether you place.",
    ],
  },
  {
    id: "law-review-journals",
    title: "Law Review and Student Journals",
    paragraphs: [
      "Texas Tech Law is home to five student-run journals, giving students far more publication opportunities than many peer schools offer. Membership across all journals is determined through a single annual spring write-on competition open to all eligible students.",
    ],
    bullets: [
      "Texas Tech Law Review — the flagship general-interest journal, publishing since 1970 (its 58th volume as of 2026), with four issues per year and an annual General Huffman Distinguished Lecture Series",
      "Estate Planning & Community Property Law Journal",
      "Journal for Technology, Law & Science",
      "Journal of the Energy Law Practitioner",
      "Texas Bank Lawyer",
    ],
  },
  {
    id: "academic-success-program",
    title: "Office of Academic Success Programs (OASP)",
    paragraphs: [
      "OASP, under Director Erica M. Lux, works with incoming students, current students, and recent graduates preparing for the bar. Services include one-on-one academic strategy sessions tailored to your learning style, weekly small-group tutoring led by trained upper-level students, drop-in office hours, study-aid workshops throughout the year, and dedicated bar exam preparation support in the final year.",
      "The office is located in Room 205 of the second-floor faculty suite — worth an early visit even if you're not struggling. Building the relationship before you need it makes it much easier to ask for help later.",
    ],
  },
  {
    id: "career-services",
    title: "Career & Professional Development Center",
    paragraphs: [
      "Texas Tech's Career & Professional Development Center connects students and alumni with employers and provides career coaching, interview preparation, and professional development support throughout law school. The outcomes speak for themselves: 96.95% of the Class of 2024 (127 of 131 graduates) secured full-time, long-term employment within ten months of graduation.",
      "Of those graduates, roughly 70% went into private firm practice, 12% into government positions, 9% into business/industry roles, and 3% into public interest work, with the remainder in clerkships. Private-sector starters earned a median salary of $82,400; public-sector entrants averaged around $76,700.",
    ],
  },
];

// ── Part IV — Resources ───────────────────────────────────────────────────

export interface ResourceCategory {
  id: string;
  title: string;
  items: { name: string; note: string }[];
}

export const PART_IV_RESOURCES: ResourceCategory[] = [
  {
    id: "books",
    title: "Recommended Books",
    items: [
      { name: "Getting to Maybe: How to Excel on Law School Exams (Fischl & Paul)", note: "The single most recommended book on how law school exams are actually graded and how to write answers that score well." },
      { name: "Examples & Explanations series (various authors, by subject)", note: "Subject-specific supplements pairing rule explanations with practice questions — used throughout the course chapters above." },
      { name: "The Glannon Guide series (various subjects)", note: "Conversational, question-and-answer-style supplements, especially strong for Torts, Civil Procedure, and Property." },
      { name: "Law School Legends audio lecture series", note: "Audio overviews useful for review during commutes or as a first pass before deeper reading." },
    ],
  },
  {
    id: "supplements",
    title: "Commercial Supplements & Bar-Prep-Adjacent Tools",
    items: [
      { name: "CALI Lessons (cali.org)", note: "Free, interactive lessons covering nearly every 1L and upper-level subject — genuinely useful and underused." },
      { name: "Quimbee / Casebriefs", note: "Case brief databases useful for double-checking your own briefs, not as a substitute for doing them yourself." },
      { name: "Themis / Barbri MPRE and bar prep materials", note: "Worth previewing in Professional Responsibility given the direct overlap with MPRE content." },
    ],
  },
  {
    id: "online-research",
    title: "Online Research Platforms",
    items: [
      { name: "Westlaw", note: "Primary legal research platform used throughout Legal Practice I/II and in most upper-level courses." },
      { name: "Lexis+", note: "Alternative/parallel research platform — most students get access to both and develop a preference." },
      { name: "Google Scholar (Case Law)", note: "Free, useful for quick case lookups outside of graded research assignments." },
    ],
  },
  {
    id: "citation",
    title: "Citation Resources",
    items: [
      { name: "The Bluebook: A Uniform System of Citation", note: "The standard legal citation manual used throughout Legal Practice I and virtually all written legal work afterward." },
    ],
  },
];

// ── Part V — Appendices ────────────────────────────────────────────────────

export const LEGAL_GLOSSARY: { term: string; definition: string }[] = [
  { term: "Actus reus", definition: "The physical act or conduct element of a crime, as distinct from the mental state (mens rea)." },
  { term: "Affirmative defense", definition: "A defense that the defendant must raise and prove (often by a preponderance of the evidence), even if the plaintiff's or prosecution's case is otherwise established." },
  { term: "Bench trial", definition: "A trial decided by a judge alone, without a jury." },
  { term: "Cause of action", definition: "A set of facts sufficient to justify a right to sue and obtain a legal remedy." },
  { term: "Collateral estoppel (issue preclusion)", definition: "Doctrine preventing re-litigation of an issue that was actually litigated and decided in a prior case." },
  { term: "Consideration", definition: "Something of legal value exchanged between parties to a contract, required for the contract to be enforceable." },
  { term: "De novo review", definition: "Appellate review in which the reviewing court considers the matter fresh, without deference to the lower court's conclusions." },
  { term: "Discovery", definition: "The pre-trial process by which parties obtain evidence from each other and third parties." },
  { term: "Dissent", definition: "An opinion by a judge who disagrees with the majority's outcome in a case." },
  { term: "Duty of care", definition: "The legal obligation to act with the level of caution a reasonable person would exercise in similar circumstances." },
  { term: "Estoppel", definition: "A doctrine preventing a party from asserting something contrary to what they previously implied, when another party has reasonably relied on that implication." },
  { term: "Fee simple", definition: "The most complete form of property ownership, with no time limit or condition attached." },
  { term: "Fiduciary duty", definition: "A heightened legal obligation to act in the best interest of another party, arising from a relationship of trust." },
  { term: "Holding", definition: "The core legal rule or principle a court establishes in deciding a case, as distinct from dicta." },
  { term: "Injunction", definition: "A court order requiring a party to do or refrain from doing a specific act." },
  { term: "Jurisdiction", definition: "A court's authority to hear and decide a case, encompassing both personal jurisdiction (over the parties) and subject-matter jurisdiction (over the type of case)." },
  { term: "Mens rea", definition: "The mental state required for criminal liability, ranging from purposeful conduct to negligence." },
  { term: "Precedent", definition: "A previously decided case that guides or binds the resolution of later cases with similar facts or issues." },
  { term: "Proximate cause", definition: "A legal (not just factual) limitation on liability, requiring that the harm be a foreseeable result of the defendant's conduct." },
  { term: "Remand", definition: "An appellate court's act of sending a case back to a lower court for further proceedings." },
  { term: "Res judicata (claim preclusion)", definition: "Doctrine barring re-litigation of a claim that has already been finally decided between the same parties." },
  { term: "Standing", definition: "A party's legal right to bring a lawsuit, generally requiring a concrete, particularized injury connected to the defendant's conduct." },
  { term: "Statute of limitations", definition: "The time period within which a lawsuit must be filed, after which the claim is barred." },
  { term: "Tort", definition: "A civil wrong (other than breach of contract) for which the law provides a remedy, typically money damages." },
  { term: "Vacate", definition: "An appellate court's act of nullifying a lower court's judgment or order." },
];

export const LATIN_TERMS: { term: string; meaning: string }[] = [
  { term: "Ab initio", meaning: "From the beginning" },
  { term: "Actus reus", meaning: "Guilty act (the conduct element of a crime)" },
  { term: "Amicus curiae", meaning: "Friend of the court (a non-party who submits a brief)" },
  { term: "Bona fide", meaning: "In good faith" },
  { term: "Certiorari", meaning: "An order by a higher court to review a lower court's decision" },
  { term: "De facto", meaning: "In fact, as a matter of practice (regardless of legal status)" },
  { term: "De jure", meaning: "By law, as a matter of legal right" },
  { term: "En banc", meaning: "By the full court, rather than a smaller panel" },
  { term: "Ex parte", meaning: "By or for one party only, without the other party present" },
  { term: "Habeas corpus", meaning: "A writ requiring a person in custody to be brought before a court" },
  { term: "In personam", meaning: "Against a specific person (jurisdiction over a person)" },
  { term: "In rem", meaning: "Against a thing (jurisdiction over property)" },
  { term: "Mens rea", meaning: "Guilty mind (the mental-state element of a crime)" },
  { term: "Per curiam", meaning: "By the court (an opinion issued collectively, without a named author)" },
  { term: "Per se", meaning: "By itself, inherently (e.g., a rule applied automatically without further analysis)" },
  { term: "Prima facie", meaning: "On its face; sufficient to establish a fact or claim unless rebutted" },
  { term: "Pro bono", meaning: "For the public good (legal work performed without charge)" },
  { term: "Res ipsa loquitur", meaning: "The thing speaks for itself (an inference of negligence from the nature of an accident)" },
  { term: "Stare decisis", meaning: "To stand by things decided (the doctrine of following precedent)" },
  { term: "Sua sponte", meaning: "Of its own accord (a court acting without a party's request)" },
];

export const CASE_BRIEF_TEMPLATE = {
  sections: [
    { label: "Case Name & Citation", prompt: "Full case name, court, year, and citation." },
    { label: "Facts", prompt: "The legally relevant facts only — who did what to whom, and what happened as a result." },
    { label: "Procedural History", prompt: "How the case moved through the court system before reaching this opinion." },
    { label: "Issue", prompt: "The precise legal question the court had to answer, phrased as a yes/no question when possible." },
    { label: "Holding", prompt: "The court's answer to the issue — the rule of law established by this case." },
    { label: "Reasoning", prompt: "Why the court reached that holding — the policy and doctrinal justifications." },
    { label: "Disposition", prompt: "What the court actually ordered (affirmed, reversed, remanded, etc.)." },
    { label: "Notes", prompt: "Dissents, concurrences, and how this case connects to others you've read." },
  ],
};

export const IRAC_TEMPLATE = {
  sections: [
    { label: "Issue", prompt: "State the precise legal question raised by the facts." },
    { label: "Rule", prompt: "State the governing legal rule, with all required elements." },
    { label: "Application", prompt: "Apply each element of the rule to the specific facts — this is where most exam points are earned or lost." },
    { label: "Conclusion", prompt: "State your conclusion clearly. If the answer is genuinely uncertain, say so and explain why." },
  ],
};
