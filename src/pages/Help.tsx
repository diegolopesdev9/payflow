import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BottomNavigation } from "@/components/BottomNavigation";
import { 
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Star,
  Search,
  ChevronRight
} from "lucide-react";

const Help = () => {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const faqs = [
    {
      question: "Como adicionar uma nova conta a pagar?",
      answer: "Para adicionar uma nova conta, vá até a tela 'Contas' e clique no botão '+' no canto superior direito. Preencha os dados da conta como descrição, valor, categoria e data de vencimento."
    },
    {
      question: "Como alterar a categoria de uma conta?",
      answer: "Você pode editar a categoria acessando os detalhes da conta e clicando em 'Editar'. Também é possível gerenciar as categorias na seção 'Categorias de Gastos' no seu perfil."
    },
    {
      question: "Como visualizar relatórios de gastos?",
      answer: "Os relatórios estão disponíveis na tela 'Relatórios' no menu inferior. Você pode visualizar gastos mensais, por categoria e comparar períodos diferentes."
    },
    {
      question: "Como alterar minha senha?",
      answer: "Vá até o seu Perfil > Segurança da Conta > Alterar Senha. Digite sua senha atual e a nova senha duas vezes para confirmar."
    },
    {
      question: "Como ativar notificações de vencimento?",
      answer: "Acesse Perfil > Notificações e ative os alertas de vencimento. Você pode escolher receber notificações 1, 3 ou 7 dias antes do vencimento."
    },
    {
      question: "Como fazer backup dos meus dados?",
      answer: "O backup automático está disponível em Perfil > Configurações do Aplicativo > Dados e Sincronização. Você também pode exportar seus dados manualmente."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendFeedback = () => {
    if (feedbackMessage.trim()) {
      // Logic to send feedback
      alert("Feedback enviado com sucesso! Obrigado pelo seu comentário.");
      setFeedbackMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/profile")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Ajuda e Suporte</h1>
              <p className="text-primary-foreground/80">Encontre respostas e entre em contato</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <Card className="fin-card">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar ajuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="fin-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Chat ao Vivo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Converse com nossa equipe de suporte
              </p>
              <Button variant="outline" className="w-full">
                Iniciar Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="fin-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Enviar E-mail</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Envie uma mensagem detalhada
              </p>
              <Button variant="outline" className="w-full">
                suporte@finapp.com
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma pergunta encontrada para "{searchQuery}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Enviar Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Sua mensagem</Label>
              <Textarea
                id="feedback"
                placeholder="Conte-nos como podemos melhorar o FinApp..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={handleSendFeedback}
              className="btn-primary-financial w-full"
            >
              Enviar Feedback
            </Button>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle>Outras Formas de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Telefone</p>
                <p className="text-sm text-muted-foreground">0800 123 4567</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">E-mail</p>
                <p className="text-sm text-muted-foreground">suporte@finapp.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Central de Ajuda</p>
                <p className="text-sm text-muted-foreground">help.finapp.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="fin-card">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            <p>FinApp v1.0.0</p>
            <p>© 2024 FinApp. Todos os direitos reservados.</p>
          </CardContent>
        </Card>

        <BottomNavigation />
      </div>
    </div>
  );
};

export default Help;