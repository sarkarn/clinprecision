import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import LoginService from "../../services/LoginService";
import {
    Shield,
    Zap,
    Users,
    BarChart3,
    BarChart2,
    Repeat,
    CheckCircle,
    Globe,
    Clock,
    Award,
    ChevronRight,
    Eye,
    EyeOff
} from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Use the LoginService to handle authentication
            const result = await LoginService.login(email, password);

            // Extract user data
            const { authData } = result;

            // Store token and userId in localStorage
            localStorage.setItem('authToken', authData.token);
            localStorage.setItem('userId', authData.userId);
            localStorage.setItem('userEmail', authData.userEmail);
            localStorage.setItem('userRole', authData.userRole);

            // Update authentication context with user information
            auth.login(
                email,
                authData.userRole,
                {
                    userId: authData.userId,
                    token: authData.token
                }
            );

            // Navigate to home page after successful login
            navigate("/");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Invalid credentials. Please try again.");
            } else {
                setError("Login failed. Please try again later.");
            }
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            title: "AI-Driven Protocol Deviation Review",
            description: "Leverage advanced AI to automatically detect, flag, and explain protocol deviations—reducing risk and accelerating study timelines.",
            icon: <Zap className="h-6 w-6" />,
        },
        {
            title: "AI-Powered Medical Coding",
            description: "Automate and standardize medical coding with intelligent suggestions, improving accuracy and compliance.",
            icon: <BarChart2 className="h-6 w-6" />,
        },
        {
            icon: <Zap className="h-6 w-6" />,
            title: "50% Faster Study Setup",
            description: "Streamlined workflows that accelerate your trials"
        },
        {
            title: "Secure & Compliant",
            description: "HIPAA, GDPR, and SOC 2 Type II, FDA 21 CFR Part 11 compliant for peace of mind.",
            icon: <Shield className="h-6 w-6" />,
        },
    ];

    const stats = [
        { number: "500+", label: "Clinical Trials" },
        { number: "50K+", label: "Patients Enrolled" },
        { number: "99.9%", label: "Uptime SLA" },
        { number: "24/7", label: "Support" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

            {/* Navigation Header */}
            <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">CP</span>
                                </div>
                                <h1 className="text-xl font-bold text-white">ClinPrecision</h1>
                            </div>
                            <nav className="hidden md:flex items-center space-x-6">
                                <a href="#" className="text-white/80 hover:text-white transition-colors">Solutions</a>
                                <a href="#" className="text-white/80 hover:text-white transition-colors">Resources</a>
                                <a href="#" className="text-white/80 hover:text-white transition-colors">About</a>
                                <a href="#" className="text-white/80 hover:text-white transition-colors">Contact</a>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-white/80 hover:text-white transition-colors">
                                Demo
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-120px)]">

                    {/* Left Column - Marketing Content */}
                    <div className="space-y-8">
                        {/* Hero Section */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30">
                                <Award className="h-4 w-4 text-blue-300 mr-2" />
                                <span className="text-blue-100 text-sm font-medium">Industry Leading EDC Platform</span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                                Accelerate Your
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
                                    Clinical Trials
                                </span>
                            </h1>

                            <p className="text-xl text-blue-100 leading-relaxed">
                                The most advanced Electronic Data Capture platform designed for modern clinical research.
                                Streamline your studies, ensure compliance, and bring life-saving treatments to market faster.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-2xl font-bold text-white">{stat.number}</div>
                                    <div className="text-blue-200 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 text-blue-300">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                                            <p className="text-blue-200 text-xs mt-1">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center space-x-6 pt-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span className="text-blue-100 text-sm">SOC 2 Type II</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-green-400" />
                                <span className="text-blue-100 text-sm">HIPAA Compliant</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Globe className="h-5 w-5 text-green-400" />
                                <span className="text-blue-100 text-sm">GDPR Ready</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Login Form */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-md">
                            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                                    <p className="text-gray-600">Sign in to your ClinPrecision account</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                disabled={loading}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 px-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ?
                                                    <EyeOff className="h-5 w-5 text-gray-400" /> :
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Signing In...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ChevronRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                    <p className="text-sm text-gray-600">
                                        Need access to ClinPrecision?{" "}
                                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                                            Request Demo
                                        </button>
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>24/7 Support</span>
                                    </div>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                    <div className="flex items-center space-x-1">
                                        <Shield className="h-3 w-3" />
                                        <span>Secure Login</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
