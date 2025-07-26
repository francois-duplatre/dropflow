'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, TrendingUp, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DropFlow
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/auth/login'}
                className="text-slate-600 hover:text-slate-900"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth/register'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                Créer un compte
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              La nouvelle génération de gestion dropshipping
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Remplacez Google Sheets
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              par une solution moderne
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Gérez vos boutiques dropshipping avec une interface élégante et intuitive. 
            Organisez vos produits, suivez vos performances et développez votre business.
          </p>
          
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/auth/register'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              À quoi ressemble DropFlow ?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Découvrez l'interface moderne et intuitive de notre application
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-slate-100 rounded-lg p-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-slate-200 h-8 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <img 
                      src="/dashboard-screenshot.png" 
                      alt="Dashboard DropFlow - Tableau de bord avec gestion multi-boutiques"
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-slate-500">
                Dashboard principal avec gestion multi-boutiques
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-100 rounded-lg p-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-slate-200 h-8 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <img 
                      src="/products-screenshot.png" 
                      alt="Gestion des produits DropFlow - Interface de gestion des produits avec statistiques et tableaux"
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-slate-500">
                Interface de gestion des produits avec statistiques
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une interface moderne pour gérer efficacement vos boutiques et produits dropshipping
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Gestion Multi-Boutiques
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Créez et gérez plusieurs boutiques depuis un seul tableau de bord. Interface en cards moderne et intuitive.
              </p>
            </Card>
            
            <Card className="p-8 border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Suivi des Produits
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Tableau moderne style Notion pour organiser vos produits avec images, prix, liens et statuts.
              </p>
            </Card>
            
            <Card className="p-8 border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Interface Épurée
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Design inspiré de Notion et Linear pour une expérience utilisateur fluide et moderne.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à moderniser votre dropshipping ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Rejoignez les milliers de vendeurs qui ont déjà abandonné Google Sheets pour DropFlow.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/auth/register'}
            className="bg-white text-blue-600 hover:bg-slate-50 px-8 py-4 text-lg shadow-xl font-semibold"
          >
            Créer mon compte gratuit
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">DropFlow</span>
          </div>
          <p className="text-slate-400">
            © 2025 DropFlow. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}