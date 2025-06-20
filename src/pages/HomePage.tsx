import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, PenTool as Tool, Users, Award, TrendingUp, ArrowRight, Star, Quote } from 'lucide-react';
import { supabase } from '../App';
import { AITool, Testimonial, Certificate } from '../types/database';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LazyImage from '../components/ui/LazyImage';
import SEOHead from '../components/seo/SEOHead';

const HomePage: React.FC = () => {
  const [featuredTools, setFeaturedTools] = useState<AITool[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use Promise.all for parallel requests with optimized queries
        const [toolsResponse, testimonialsResponse, certificatesResponse] = await Promise.all([
          supabase
            .from('ai_tools')
            .select(`
              id,
              name,
              description,
              image_url,
              category:category_id(name, icon)
            `)
            .eq('is_featured', true)
            .limit(3),
          
          supabase
            .from('testimonials')
            .select(`
              id,
              content,
              rating,
              user:user_id(first_name, last_name, avatar_url)
            `)
            .eq('is_featured', true)
            .limit(3),
          
          supabase
            .from('certificates')
            .select(`
              id,
              title,
              description,
              certificate_url,
              feedback,
              rating,
              category,
              user:user_id(first_name, last_name, avatar_url)
            `)
            .eq('is_featured', true)
            .eq('is_verified', true)
            .not('feedback', 'is', null)
            .limit(6)
        ]);

        if (toolsResponse.error) throw toolsResponse.error;
        if (testimonialsResponse.error) throw testimonialsResponse.error;
        if (certificatesResponse.error) throw certificatesResponse.error;

        setFeaturedTools(toolsResponse.data || []);
        setTestimonials(testimonialsResponse.data || []);
        setCertificates(certificatesResponse.data || []);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const homePageStructuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Monster Production - AI Tools, Hackathons & Business Growth",
    "description": "Expert AI mentorship, hackathon coaching, and business growth strategies by Suraj Singh",
    "url": "https://monsterproduction.netlify.app/",
    "mainEntity": {
      "@type": "Organization",
      "name": "Monster Production",
      "founder": "Suraj Singh"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://monsterproduction.netlify.app/"
        }
      ]
    }
  }), []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Monster Production - AI Tools, Hackathons & Business Growth | Suraj Singh"
        description="Monster Production, founded by Suraj Singh, helps students and businesses master AI tools, win hackathons, and achieve business growth through expert mentorship and innovative solutions."
        keywords="Monster Production, Suraj Singh, AI tools, hackathon strategies, business growth, AI mentorship, artificial intelligence, tech mentorship, Lucknow, startup consulting, machine learning, AI coaching"
        url="https://monsterproduction.netlify.app/"
        structuredData={homePageStructuredData}
      />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-purple-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Empower Your AI Journey With Expert Mentorship
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-purple-100">
                Discover AI tools, get personalized guidance, and excel in hackathons, workshops, and business growth.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/tools"
                  className="px-6 py-3 bg-white text-purple-700 rounded-md font-semibold hover:bg-purple-50 transition-colors shadow-lg flex items-center"
                >
                  Explore AI Tools
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/request-help"
                  className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center"
                >
                  Request Mentorship
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <LazyImage
                src="https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="AI Mentorship and Technology Consulting by Monster Production"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Can Help You</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Monster Production provides a comprehensive platform for AI enthusiasts, entrepreneurs, and organizations to thrive in the AI landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI Tools */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                <Tool className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Tools Directory</h3>
              <p className="text-gray-600 mb-4">
                Discover curated AI tools for various purposes including hackathons, business growth, and learning.
              </p>
              <Link
                to="/tools"
                className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
              >
                Browse Tools <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            {/* Mentorship */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Mentorship</h3>
              <p className="text-gray-600 mb-4">
                Get guidance from AI experts who'll help you navigate challenges and accelerate your learning.
              </p>
              <Link
                to="/request-help"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                Request Mentorship <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            {/* Hackathons */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hackathon Support</h3>
              <p className="text-gray-600 mb-4">
                Receive coaching and resources to excel in AI hackathons and competitions.
              </p>
              <Link
                to="/request-help"
                className="text-orange-600 hover:text-orange-800 font-medium inline-flex items-center"
              >
                Get Hackathon Help <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            {/* Business Growth */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Business AI Integration</h3>
              <p className="text-gray-600 mb-4">
                Transform your business with strategic AI implementation and growth strategies.
              </p>
              <Link
                to="/request-help"
                className="text-green-600 hover:text-green-800 font-medium inline-flex items-center"
              >
                Grow Your Business <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Featured AI Tools</h2>
              <Link
                to="/tools"
                className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
              >
                View All Tools <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTools.map((tool) => (
                <article key={tool.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    {tool.image_url ? (
                      <LazyImage
                        src={tool.image_url}
                        alt={`${tool.name} - AI Tool for ${tool.category?.name || 'productivity'}`}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600">
                        <Tool className="w-16 h-16 text-white" />
                      </div>
                    )}
                    {tool.category && (
                      <span className="absolute top-4 right-4 bg-purple-600 text-white text-sm px-3 py-1 rounded-full">
                        {tool.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{tool.description}</p>
                    <Link
                      to={`/tools/${tool.id}`}
                      className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
                    >
                      Learn More <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Happy Customers - Certificates Section */}
      {certificates.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Happy Customers & Success Stories</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how Monster Production has helped our community achieve their goals and earn recognition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {certificates.map((certificate) => (
                <article key={certificate.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <LazyImage
                      src={certificate.certificate_url}
                      alt={`${certificate.title} certificate by ${certificate.user?.first_name || 'Student'}`}
                      className="w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Verified Success
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4 flex-shrink-0">
                        {certificate.user?.avatar_url ? (
                          <LazyImage
                            src={certificate.user.avatar_url}
                            alt={`${certificate.user.first_name} ${certificate.user.last_name}`}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {certificate.user?.first_name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {certificate.user 
                            ? `${certificate.user.first_name} ${certificate.user.last_name}` 
                            : 'Anonymous User'}
                        </h4>
                        <p className="text-sm text-gray-500">{certificate.title}</p>
                      </div>
                    </div>

                    {certificate.feedback && (
                      <div className="mb-4">
                        <Quote className="w-5 h-5 text-purple-500 mb-2" />
                        <p className="text-gray-700 italic leading-relaxed">
                          "{certificate.feedback}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (certificate.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{certificate.rating}/5</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {certificate.category}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/certificates"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View All Success Stories
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Community Says</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hear from people who have transformed their AI skills and projects with our mentorship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <article key={testimonial.id} className="bg-gray-50 p-8 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                      {testimonial.user?.avatar_url ? (
                        <LazyImage
                          src={testimonial.user.avatar_url}
                          alt={`${testimonial.user.first_name} ${testimonial.user.last_name}`}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {testimonial.user?.first_name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {testimonial.user 
                          ? `${testimonial.user.first_name} ${testimonial.user.last_name}` 
                          : 'Anonymous User'}
                      </h4>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Accelerate Your AI Journey?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-10 text-indigo-100">
            Get personalized mentorship, access to curated AI tools, and join a community of innovators.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/tools"
              className="px-8 py-3 bg-white text-purple-700 rounded-md font-semibold hover:bg-purple-50 transition-colors shadow-lg"
            >
              Explore AI Tools
            </Link>
            <Link
              to="/request-help"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-md font-semibold hover:bg-white/10 transition-colors"
            >
              Request Mentorship
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;