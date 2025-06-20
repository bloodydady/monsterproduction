import React from 'react';
import { Users, Award, Book, Lightbulb, CheckCircle } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Monster Production</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to empower the next generation of AI innovators through mentorship,
            tools, and community support.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-6">
              Monster Production was founded with a simple but powerful mission: to democratize AI knowledge
              and make cutting-edge tools accessible to everyone, from students to entrepreneurs.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              We believe that with the right guidance, anyone can leverage AI to create innovative
              solutions, win hackathons, grow businesses, and drive positive change in the world.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700">
                  <strong>Mentorship:</strong> Connecting aspiring AI enthusiasts with experienced mentors
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700">
                  <strong>Knowledge:</strong> Curating and organizing AI tools by use case
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700">
                  <strong>Community:</strong> Building a supportive ecosystem of AI innovators
                </p>
              </div>
            </div>
          </div>
          <div>
            <img
              src="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Team collaboration"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inclusivity</h3>
              <p className="text-gray-600">
                We believe AI should be accessible to everyone, regardless of background or experience level.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest quality in our mentorship, tools, and community support.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Book className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Education</h3>
              <p className="text-gray-600">
                We're committed to continuous learning and sharing knowledge with our community.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We embrace creativity and forward-thinking to push the boundaries of what's possible with AI.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white rounded-1g shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1748152637747-665ae90ed31f?q=80&w=2117&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Suraj Singh"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Suraj Singh</h3>
                <p className="text-purple-600 mb-4">Founder & CEO</p>
                <p className="text-gray-600 mb-4">
                  AI researcher and entrepreneur with a passion for making advanced technology accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
        
            


        {/* Join Us CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Whether you're looking to learn AI, seeking mentorship, or wanting to contribute your expertise,
            we welcome you to be part of our growing community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/register"
              className="px-6 py-3 bg-white text-purple-600 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up Now
            </a>
            <a
              href="/contact"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-md font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;