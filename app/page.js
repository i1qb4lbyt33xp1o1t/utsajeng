"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiArrowRight,
  FiUser,
  FiBriefcase,
  FiAward,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiStar,
  FiMessageSquare,
} from "react-icons/fi";
import { db } from "./firebase"; // Adjust path based on your project structure
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const cursorRef = useRef(null);

  // Custom cursor effect
  useEffect(() => {
    const moveCursor = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  // Dark mode handling
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("darkMode");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialDarkMode = savedMode ? savedMode === "true" : prefersDark;
      setDarkMode(initialDarkMode);
      console.log("Initial darkMode:", initialDarkMode); // Debug
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", darkMode);
      localStorage.setItem("darkMode", darkMode);
      console.log("Applying darkMode:", darkMode); // Debug
    }
  }, [darkMode]);

  // Fetch comments and ratings from Firestore
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "comments"));
        const commentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsData.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    const fetchRatings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ratings"));
        const ratingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRatings(ratingsData);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchComments();
    fetchRatings();
  }, []);

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commenterName.trim() || !newComment.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        name: commenterName,
        comment: newComment,
        timestamp: serverTimestamp(),
      });
      setComments([
        {
          name: commenterName,
          comment: newComment,
          timestamp: new Date(),
        },
        ...comments,
      ]);
      setNewComment("");
      setCommenterName("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async () => {
    if (newRating < 1 || newRating > 5) return;

    try {
      await addDoc(collection(db, "ratings"), {
        rating: newRating,
        timestamp: serverTimestamp(),
      });
      setRatings([...ratings, { rating: newRating, timestamp: new Date() }]);
      setNewRating(0);
    } catch (error) {
      console.error("Error adding rating:", error);
    }
  };

  // Handle chatbot submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      });
      const data = await response.json();
      if (data.error) {
        setChatResponse("Sorry, something went wrong with the AI. Try again!");
      } else {
        setChatResponse(data.response);
      }
      setChatInput("");
    } catch (error) {
      console.error("Error with AI:", error);
      setChatResponse("Failed to connect to the AI. Please try again later.");
    }
  };

  // Calculate average rating
  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : "0.0";

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      console.log("Toggling to darkMode:", newMode); // Debug
      return newMode;
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { id: "home", label: "Home", icon: <FiUser /> },
    { id: "about", label: "About", icon: <FiBriefcase /> },
    { id: "portfolio", label: "Work", icon: <FiAward /> },
    { id: "contact", label: "Contact", icon: <FiMail /> },
    { id: "feedback", label: "Feedback", icon: <FiStar /> },
    { id: "chatbot", label: "Chatbot", icon: <FiMessageSquare /> },
  ];

  const portfolios = [
    {
      id: 1,
      title: "E-commerce Platform",
      company: "Shopify Partner",
      period: "2023 - Present",
      description:
        "Redesigned UI/UX for major e-commerce platform with 30% increase in conversion rates.",
      details: [
        "User research and persona development",
        "Wireframing and prototyping",
        "Responsive design implementation",
        "Usability testing and iteration",
      ],
      tags: ["UI Design", "UX Research", "Figma", "User Testing"],
      image: "/ecommerce.jpg",
    },
    {
      id: 2,
      title: "Banking App",
      company: "FinTech Startup",
      period: "2021 - 2022",
      description: "Mobile banking app focused on simplicity for first-time users.",
      details: [
        "User flows and information architecture",
        "Custom icon set and illustrations",
        "Design system development",
        "Developer collaboration",
      ],
      tags: ["Mobile Design", "Design Systems", "Illustration", "Prototyping"],
      image: "/banking.jpg",
    },
    {
      id: 3,
      title: "Healthcare Dashboard",
      company: "HealthTech Corp",
      period: "2019 - 2021",
      description:
        "Analytics dashboard for healthcare providers tracking patient outcomes.",
      details: [
        "Data visualization design",
        "Medical professional interviews",
        "Workflow optimization",
        "ADA compliance",
      ],
      tags: ["Data Viz", "Dashboard Design", "Accessibility", "B2B"],
      image: "/healthcare.jpg",
    },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    }
  };

  const openPortfolioDetail = (portfolio) => {
    setSelectedPortfolio(portfolio);
    document.body.style.overflow = "hidden";
  };

  const closePortfolioDetail = () => {
    setSelectedPortfolio(null);
    document.body.style.overflow = "auto";
  };

  const socialLinks = [
    { icon: <FiGithub />, url: "https://github.com" },
    { icon: <FiLinkedin />, url: "https://linkedin.com" },
    { icon: <FiTwitter />, url: "https://twitter.com" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#fef6f5] text-gray-800"
      }`}
      style={
        darkMode
          ? { backgroundColor: "#111827" }
          : { backgroundColor: "#fef6f5" }
      }
    >
     

      {/* Floating Social Links */}
      <div className="fixed left-6 bottom-24 z-40 hidden md:flex flex-col gap-4">
        {socialLinks.map((link, index) => (
          <motion.a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -4 }}
            className={`p-2 rounded-full ${
              darkMode ? "bg-gray-800 text-pink-300" : "bg-pink-100 text-pink-600"
            } shadow-md`}
          >
            {link.icon}
          </motion.a>
        ))}
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed w-full z-40 ${
          darkMode
            ? "bg-gray-800/90 backdrop-blur-md"
            : "bg-[#ffd6d0]/90 backdrop-blur-md"
        } shadow-sm`}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-xl font-bold cursor-pointer"
            onClick={() => scrollToSection("home")}
          >
            <span
              className={`bg-gradient-to-r ${
                darkMode
                  ? "from-pink-400 to-purple-500"
                  : "from-pink-600 to-purple-600"
              } bg-clip-text text-transparent`}
            >
              Ajeng Reyra Prameswari
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -2 }}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? darkMode
                      ? "bg-pink-600/20 text-pink-300"
                      : "bg-pink-500/20 text-pink-600"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-700/50"
                    : "text-gray-700 hover:bg-pink-200/50"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Mobile Nav Toggle */}
          <button
            className="md:hidden p-2 rounded-lg focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <FiX
                size={24}
                className={darkMode ? "text-pink-300" : "text-pink-600"}
              />
            ) : (
              <FiMenu
                size={24}
                className={darkMode ? "text-pink-300" : "text-pink-600"}
              />
            )}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div
                className={`px-4 pb-4 ${
                  darkMode ? "bg-gray-800" : "bg-[#ffd6d0]"
                }`}
              >
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * navItems.indexOf(item) }}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-base font-medium ${
                      activeSection === item.id
                        ? darkMode
                          ? "bg-pink-600 text-white"
                          : "bg-pink-500 text-white"
                        : darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-pink-200"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-6 left-6 z-40 p-3 rounded-full shadow-lg ${
          darkMode ? "bg-gray-700 text-yellow-300" : "bg-pink-100 text-pink-600"
        }`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
      </motion.button>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-28 pb-16">
        {/* Home Section */}
        <section
  id="home"
  className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-12 py-12"
>
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="md:w-1/2 flex justify-center"
  >
    <div
      className={`relative w-64 h-64 md:w-96 md:h-96 rounded-2xl overflow-hidden border-4 ${
        darkMode ? "border-pink-500/30" : "border-pink-400/30"
      } shadow-2xl`}
    >
      <img
        src="/profile3.jpeg"
        alt="Profile"
        className="w-full h-full object-cover"
      />
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          darkMode
            ? "from-gray-900/80 to-transparent"
            : "from-white/80 to-transparent"
        } opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6`}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-lg font-medium ${
            darkMode ? "text-pink-300" : "text-pink-700"
          }`}
        >
          UI/UX Designer & Developer
                    </motion.div>
                  </div>
                
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:w-1/2 text-center md:text-left"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-sm font-mono mb-4 ${
                darkMode ? "text-pink-400" : "text-pink-600"
              }`}
            >
              Hello, I'm
            </motion.div>
            <h1
              className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r ${
                darkMode
                  ? "from-pink-400 to-purple-400"
                  : "from-pink-600 to-purple-600"
              } bg-clip-text text-transparent`}
            >
              Ajeng Reyra Prameswari
            </h1>
            <h2
              className={`text-2xl md:text-3xl font-semibold mb-6 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Crafting <span className="underline decoration-wavy">delightful</span>{" "}
              digital experiences
            </h2>
            <p
              className={`text-lg mb-8 leading-relaxed ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              I design and build intuitive interfaces that users love. With a focus on
              human-centered design, I create solutions that are both beautiful and
              functional.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection("portfolio")}
                className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 ${
                  darkMode
                    ? "bg-pink-600 hover:bg-pink-700"
                    : "bg-pink-500 hover:bg-pink-600"
                } text-white shadow-lg`}
              >
                View My Work <FiArrowRight />
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection("contact")}
                className={`px-6 py-3 rounded-full font-medium ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-pink-100 hover:bg-pink-200"
                } shadow-lg`}
              >
                Contact Me
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="min-h-screen py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
              <div className="md:w-1/2">
                <h2
                  className={`text-4xl font-bold mb-6 ${
                    darkMode ? "text-pink-400" : "text-pink-600"
                  }`}
                >
                  About <span className="underline decoration-wavy">Me</span>
                </h2>
                <div
                  className={`space-y-4 text-lg leading-relaxed ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <p>
                  Saya adalah seorang Mahasiswa lulusan SMA, yang sedang menempuh pendidikan di Ma’soem University semester 4 Jurusan Sistem Informasi.
                  </p>
                  <p>
                  Semenjak saya memasuki dunia perkuliahan, saya menjadi banyak pengalaman.
                  </p>
                  <p>
                  Saya juga seseorang yang selalu termotivasi untuk mencoba hal baru, saya mampu bersosialisasi dengan baik, bisa beradaptasi dengan sesama dan mudah bergaul. Saya mampu bertanggung jawab atas semua tanggung jawab saya.
                  </p>
                </div>
              </div>
              <div className="md:w-1/2">
                <div
                  className={`p-8 rounded-3xl shadow-xl ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                    <FiUser
                      className={`${
                        darkMode ? "text-pink-400" : "text-pink-600"
                      } text-2xl`}
                    />
                    <span>Personal Info</span>
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                      <FiMail
                        className={`mt-1 flex-shrink-0 ${
                          darkMode ? "text-pink-400" : "text-pink-600"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">Email</h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          ajengreyra08@gmail.com
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <FiPhone
                        className={`mt-1 flex-shrink-0 ${
                          darkMode ? "text-pink-400" : "text-pink-600"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">Phone</h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          0822232323
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <FiMapPin
                        className={`mt-1 flex-shrink-0 ${
                          darkMode ? "text-pink-400" : "text-pink-600"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">Location</h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Rancaekek, Bandung
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div
                className={`p-8 rounded-3xl shadow-xl ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <FiBriefcase
                    className={`${
                      darkMode ? "text-pink-400" : "text-pink-600"
                    } text-2xl`}
                  />
                  <span>Experience</span>
                </h3>
                <div className="space-y-6">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="border-l-2 border-pink-500 pl-4"
                  >
                    <h4 className="font-medium">Senior UI/UX Designer</h4>
                    <p
                      className={`text-sm mb-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Creative Agency • 2021-Present
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Leading design team for client projects across various industries.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="border-l-2 border-pink-500 pl-4"
                  >
                    <h4 className="font-medium">UI Designer</h4>
                    <p
                      className={`text-sm mb-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Tech Startup • 2019-2021
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Designed core product features and design system components.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="border-l-2 border-pink-500 pl-4"
                  >
                    <h4 className="font-medium">UX Intern</h4>
                    <p
                      className={`text-sm mb-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Design Studio • 2018-2019
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Conducted user research and created wireframes.
                    </p>
                  </motion.div>
                </div>
              </div>

              <div
                className={`p-8 rounded-3xl shadow-xl ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <FiAward
                    className={`${
                      darkMode ? "text-pink-400" : "text-pink-600"
                    } text-2xl`}
                  />
                  <span>Skills & Tools</span>
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Design</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "UI Design",
                        "UX Research",
                        "Wireframing",
                        "Prototyping",
                        "User Testing",
                        "Illustration",
                      ].map((skill) => (
                        <motion.span
                          key={skill}
                          whileHover={{ y: -2 }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode
                              ? "bg-gray-700 text-pink-300"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Development</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "HTML/CSS",
                        "JavaScript",
                        "React",
                        "Next.js",
                        "Tailwind CSS",
                        "Framer Motion",
                      ].map((skill) => (
                        <motion.span
                          key={skill}
                          whileHover={{ y: -2 }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode
                              ? "bg-gray-700 text-purple-300"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Figma",
                        "Adobe XD",
                        "Sketch",
                        "Photoshop",
                        "Illustrator",
                        "VS Code",
                      ].map((skill) => (
                        <motion.span
                          key={skill}
                          whileHover={{ y: -2 }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode
                              ? "bg-gray-700 text-yellow-300"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="min-h-screen py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2
                className={`text-4xl font-bold mb-4 ${
                  darkMode ? "text-pink-400" : "text-pink-600"
                }`}
              >
                My <span className="underline decoration-wavy">Work</span>
              </h2>
              <p
                className={`max-w-2xl mx-auto text-lg ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Selected projects that showcase my design process and problem-solving
                approach.
              </p>
            </div>

            {/* Timeline for Portfolio */}
            <div className="relative">
              <div
                className={`absolute left-4 md:left-1/2 w-1 ${
                  darkMode ? "bg-pink-600" : "bg-pink-300"
                } h-full transform -translate-x-1/2`}
              ></div>
              {portfolios.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className={`relative mb-12 flex ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } flex-col items-center md:items-start`}
                >
                  <div
                    className={`absolute left-4 md:left-1/2 w-4 h-4 ${
                      darkMode ? "bg-pink-400" : "bg-pink-600"
                    } rounded-full transform -translate-x-1/2 z-10`}
                  ></div>
                  <motion.div
                    whileHover={{ y: -8 }}
                    onClick={() => openPortfolioDetail(item)}
                    className={`w-full md:w-5/12 p-6 rounded-2xl shadow-xl cursor-pointer ${
                      darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-pink-100"
                    } ${index % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        darkMode ? "text-pink-400" : "text-pink-600"
                      }`}
                    >
                      {item.period}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <div
                      className={`text-sm font-medium mb-3 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {item.company}
                    </div>
                    <p
                      className={`mb-4 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-1 rounded-full text-xs ${
                            darkMode
                              ? "bg-gray-700 text-pink-300"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2
                className={`text-4xl font-bold mb-4 ${
                  darkMode ? "text-pink-400" : "text-pink-600"
                }`}
              >
                Get In <span className="underline decoration-wavy">Touch</span>
              </h2>
              <p
                className={`max-w-2xl mx-auto text-lg ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Have a project in mind or want to discuss potential opportunities? I'd
                love to hear from you.
              </p>
            </div>

            <div
              className={`p-8 rounded-3xl shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
                  <p
                    className={`mb-6 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Feel free to reach out through any of these channels. I typically
                    respond within 24 hours.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                      <FiMail
                        className={`mt-1 flex-shrink-0 text-2xl ${
                          darkMode ? "text-pink-400" : "text-pink-600"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">Email</h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          ajengreyra08@gmail.com
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <FiPhone
                        className={`mt-1 flex-shrink-0 text-2xl ${
                          darkMode ? "text-pink-400" : "text-pink-600"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">Phone</h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          0832732323
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <FiMapPin
                        className={`mt-1 flex-shrink-0 text-2xl ${
                          darkMode ? "text-pink-400" : "text-pink-600"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">Location</h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Rancaekek, Bandung
                        </p>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-8 flex gap-4">
                    {socialLinks.map((link, index) => (
                      <motion.a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -4 }}
                        className={`p-3 rounded-full ${
                          darkMode
                            ? "bg-gray-700 text-pink-300"
                            : "bg-pink-100 text-pink-600"
                        } shadow-md`}
                      >
                        {link.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div>
                  <form className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500"
                            : "bg-white border-gray-300 focus:ring-pink-400 focus:border-pink-400"
                        }`}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500"
                            : "bg-white border-gray-300 focus:ring-pink-400 focus:border-pink-400"
                        }`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows="5"
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500"
                            : "bg-white border-gray-300 focus:ring-pink-400 focus:border-pink-400"
                        }`}
                        placeholder="Tell me about your project..."
                      ></textarea>
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full px-6 py-4 rounded-full font-medium ${
                        darkMode
                          ? "bg-pink-600 hover:bg-pink-700"
                          : "bg-pink-500 hover:bg-pink-600"
                      } text-white shadow-lg`}
                    >
                      Send Message
                    </motion.button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feedback Section */}
        <section id="feedback" className="min-h-screen py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2
                className={`text-4xl font-bold mb-4 ${
                  darkMode ? "text-pink-400" : "text-pink-600"
                }`}
              >
                Share Your <span className="underline decoration-wavy">Feedback</span>
              </h2>
              <p
                className={`max-w-2xl mx-auto text-lg ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                I value your thoughts! Please leave a comment or rate my portfolio.
              </p>
            </div>

            <div
              className={`p-8 rounded-3xl shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              {/* Rating Section */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-4">Rate My Portfolio</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        className="focus:outline-none"
                      >
                        <FiStar
                          size={32}
                          className={
                            star <= (ratingHover || newRating)
                              ? darkMode
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-yellow-500 fill-yellow-500"
                              : darkMode
                              ? "text-gray-600"
                              : "text-gray-300"
                          }
                        />
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRatingSubmit}
                    disabled={newRating === 0}
                    className={`px-4 py-2 rounded-full font-medium ${
                      newRating === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : darkMode
                        ? "bg-pink-600 hover:bg-pink-700"
                        : "bg-pink-500 hover:bg-pink-600"
                    } text-white shadow-lg`}
                  >
                    Submit Rating
                  </motion.button>
                </div>
                <p
                  className={`text-lg ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Rating: {averageRating} (from {ratings.length}{" "}
                  {ratings.length === 1 ? "voter" : "voters"})
                </p>
              </div>

              {/* Comment Form */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-4">Leave a Comment</h3>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="commenterName"
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="commenterName"
                      value={commenterName}
                      onChange={(e) => setCommenterName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500"
                          : "bg-white border-gray-300 focus:ring-pink-400 focus:border-pink-400"
                      }`}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newComment"
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Your Comment
                    </label>
                    <textarea
                      id="newComment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows="4"
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500"
                          : "bg-white border-gray-300 focus:ring-pink-400 focus:border-pink-400"
                      }`}
                      placeholder="Share your thoughts..."
                      required
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-6 py-3 rounded-full font-medium ${
                      darkMode
                        ? "bg-pink-600 hover:bg-pink-700"
                        : "bg-pink-500 hover:bg-pink-600"
                    } text-white shadow-lg`}
                  >
                    Submit Comment
                  </motion.button>
                </form>
              </div>

              {/* Comments Display */}
              <div>
                <h3 className="text-2xl font-semibold mb-6">Comments</h3>
                {comments.length === 0 ? (
                  <p
                    className={`text-lg ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`p-6 rounded-2xl ${
                          darkMode ? "bg-gray-700" : "bg-pink-50"
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              darkMode ? "bg-pink-600" : "bg-pink-500"
                            } text-white font-semibold`}
                          >
                            {comment.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium">{comment.name}</h4>
                            <p
                              className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {comment.timestamp
                                ? new Date(
                                    comment.timestamp.seconds
                                      ? comment.timestamp.seconds * 1000
                                      : comment.timestamp
                                  ).toLocaleDateString()
                                : "Just now"}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {comment.comment}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Chatbot Section */}
        <section id="chatbot" className="min-h-screen py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2
                className={`text-4xl font-bold mb-4 ${
                  darkMode ? "text-pink-400" : "text-pink-600"
                }`}
              >
                Chat with <span className="underline decoration-wavy">AI</span>
              </h2>
              <p
                className={`max-w-2xl mx-auto text-lg ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Have a question about design, tech, or my work? Ask my AI assistant!
              </p>
            </div>

            <div
              className={`p-8 rounded-3xl shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3 className="text-2xl font-semibold mb-4">Ask Me Anything</h3>
              <form onSubmit={handleChatSubmit} className="space-y-4 mb-8">
                <div>
                  <label
                    htmlFor="chatInput"
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Your Question
                  </label>
                  <textarea
                    id="chatInput"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    rows="4"
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500"
                        : "bg-white border-gray-300 focus:ring-pink-400 focus:border-pink-400"
                    }`}
                    placeholder="E.g., What makes a great UI design?"
                    required
                  ></textarea>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 ${
                    darkMode
                      ? "bg-pink-600 hover:bg-pink-700"
                      : "bg-pink-500 hover:bg-pink-600"
                  } text-white shadow-lg`}
                >
                  Send <FiArrowRight />
                </motion.button>
              </form>

              {chatResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`p-6 rounded-2xl ${
                    darkMode ? "bg-gray-700" : "bg-pink-50"
                  }`}
                >
                  <h4 className="font-semibold mb-2">AI Response:</h4>
                  <p
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {chatResponse}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      {/* Portfolio Detail Modal */}
      <AnimatePresence>
        {selectedPortfolio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={closePortfolioDetail}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className={`relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closePortfolioDetail}
                className={`absolute top-6 right-6 p-2 rounded-full ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-pink-100"
                }`}
              >
                <FiX size={24} />
              </button>

              <div className="p-8">
                <div className="mb-8">
                  <div
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-pink-400" : "text-pink-600"
                    }`}
                  >
                    {selectedPortfolio.period}
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{selectedPortfolio.title}</h2>
                  <div
                    className={`text-lg font-medium mb-6 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {selectedPortfolio.company}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div
                      className={`h-64 rounded-2xl mb-6 ${
                        darkMode ? "bg-gray-700" : "bg-pink-100"
                      } flex items-center justify-center`}
                    >
                      <div
                        className={`text-4xl ${
                          darkMode ? "text-pink-400" : "text-pink-600"
                        }`}
                      >
                        Project Preview
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {selectedPortfolio.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode
                              ? "bg-gray-700 text-pink-300"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      className={`mb-8 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <h3 className="text-xl font-semibold mb-3">Project Overview</h3>
                      <p className="mb-4">{selectedPortfolio.description}</p>
                      <h3 className="text-xl font-semibold mb-3">Key Contributions</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        {selectedPortfolio.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closePortfolioDetail}
                      className={`px-6 py-3 rounded-full font-medium ${
                        darkMode
                          ? "bg-pink-600 hover:bg-pink-700"
                          : "bg-pink-500 hover:bg-pink-600"
                      } text-white shadow-lg`}
                    >
                      Close Project
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}