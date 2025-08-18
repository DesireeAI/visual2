import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MessageCircle, Check, X, Loader2, Trash2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomInput } from '@/components/ui/CustomInput';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useApi } from '@/hooks/useApi';
import { WhatsAppInstance } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export const WhatsAppChannels: React.FC = () => {
  const { fetchInstances, verifyInstance, post, del, loading, error } = useApi();
  const { session } = useAuth();
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInstance, setNewInstance] = useState({
    instance_name: `clinic_instance_${Date.now()}`,
    phone_number: '',
    type: 'WHATSAPP-BAILEYS' as WhatsAppInstance['type'],
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadInstances = useCallback(async () => {
    try {
      const data = await fetchInstances();
      console.log('Fetched instances:', data);
      setInstances(data || []);
    } catch (err) {
      console.error('Error fetching instances:', err);
      toast.error('Falha ao carregar instâncias: ' + (err.message || 'Erro desconhecido'));
    }
  }, [fetchInstances]);

  useEffect(() => {
    loadInstances();
  }, [loadInstances]);

  useEffect(() => {
    console.log('Instances state:', instances);
  }, [instances]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const interval = setInterval(async () => {
      const connectingInstances = instances.filter((inst) => inst.status === 'connecting');
      if (connectingInstances.length === 0) return;
      try {
        for (const instance of connectingInstances) {
          await handleVerifyInstance(instance);
        }
      } catch (err) {
        console.error('Error polling instance status:', err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [instances, session]);

  const validatePhone = (phone: string) => {
    const regex = /^\+55\d{2}9\d{8}$/;
    if (!regex.test(phone)) {
      setPhoneError('O número de telefone deve estar no formato +55DDD9NNNNNNNN (ex.: +5511999999999)');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleCreateInstance = async () => {
    if (!validatePhone(newInstance.phone_number)) return;
    try {
      console.log('JWT Token:', session?.access_token);
      if (session?.access_token) {
        try {
          const base64Payload = session.access_token.split('.')[1];
          const decodedPayload = JSON.parse(atob(base64Payload));
          console.log('JWT Payload:', JSON.stringify(decodedPayload, null, 2));
        } catch (err) {
          console.error('Error decoding JWT:', err);
        }
      } else {
        console.error('No access token found in session');
      }

      const instance = await post('/create-instance', {
        instance_name: newInstance.instance_name,
        phone_number: newInstance.phone_number.replace('+', ''),
        type: newInstance.type,
      });
      setInstances((prev) => [...prev, instance]);
      setNewInstance({
        instance_name: `clinic_instance_${Date.now()}`,
        phone_number: '',
        type: 'WHATSAPP-BAILEYS',
      });
      setShowCreateForm(false);
      await loadInstances();
      toast.success('Instância WhatsApp criada com sucesso!');
    } catch (err: any) {
      console.error('Error creating instance:', err);
      toast.error('Falha ao criar instância: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleVerifyInstance = async (instance: WhatsAppInstance) => {
    setIsVerifying(instance.api_key);
    try {
      const result = await verifyInstance(instance.api_key);
      setInstances((prev) =>
        prev.map((inst) =>
          inst.api_key === instance.api_key ? { ...inst, status: result.status } : inst
        )
      );
      console.log('Instance verification result:', result);
      toast.success(`Instância ${instance.instance_name} verificada: ${result.status}`);
    } catch (err: any) {
      console.error('Error verifying instance:', err);
      toast.error('Falha ao verificar instância: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsVerifying(null);
    }
  };

  const handleDeleteInstance = async (instance: WhatsAppInstance) => {
    if (!window.confirm(`Tem certeza que deseja excluir a instância ${instance.instance_name}?`)) return;
    setIsDeleting(instance.api_key);
    try {
      await del(`/delete-instance/${instance.api_key}`);
      setInstances((prev) => prev.filter((inst) => inst.api_key !== instance.api_key));
      toast.success(`Instância ${instance.instance_name} excluída com sucesso`);
    } catch (err: any) {
      console.error('Error deleting instance:', err);
      toast.error('Falha ao excluir instância: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusIcon = (status: WhatsAppInstance['status']) => {
    switch (status) {
      case 'connected':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'connecting':
        return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
      case 'disconnected':
        return <X className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: WhatsAppInstance['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  if (loading && instances.length === 0) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Erro: {error}
        <CustomButton className="mt-4" onClick={loadInstances}>
          Tentar novamente
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2 text-green-600" />
            Canais WhatsApp
          </h2>
          <p className="text-gray-600">Gerencie suas instâncias do WhatsApp para comunicação automatizada</p>
        </div>
        <CustomButton onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Canal
        </CustomButton>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Nova Instância WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <CustomInput
                  label="Número de Telefone"
                  value={newInstance.phone_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNewInstance({ ...newInstance, phone_number: e.target.value });
                    validatePhone(e.target.value);
                  }}
                  placeholder="+5511999999999"
                />
                {phoneError && <p className="text-red-600 text-sm mt-1">{phoneError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de WhatsApp</label>
                <select
                  value={newInstance.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setNewInstance({
                      ...newInstance,
                      type: e.target.value as WhatsAppInstance['type'],
                    })
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="WHATSAPP-BAILEYS">WhatsApp Baileys</option>
                  <option value="WHATSAPP-BUSINESS">WhatsApp Business</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <CustomButton variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </CustomButton>
              <CustomButton
                onClick={handleCreateInstance}
                disabled={loading || !newInstance.phone_number.trim() || !!phoneError}
              >
                Criar Instância
              </CustomButton>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((instance) => (
          <Card key={instance.api_key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageCircle className="w-6 h-6 text-green-600 mr-2" />
                  <div>
                    <CardTitle>{instance.instance_name || 'Instância sem nome'}</CardTitle>
                    <p className="text-sm text-gray-500">{instance.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(instance.status)}
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerifyInstance(instance)}
                    disabled={isVerifying === instance.api_key || isDeleting === instance.api_key}
                  >
                    {isVerifying === instance.api_key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Verificar'
                    )}
                  </CustomButton>
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteInstance(instance)}
                    disabled={isDeleting === instance.api_key || isVerifying === instance.api_key}
                  >
                    {isDeleting === instance.api_key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </CustomButton>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  instance.status
                )}`}
              >
                {instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
              </div>
              {instance.status === 'connected' && (
                <div className="text-center p-4 mt-4">
                  <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600 font-medium">Conectado com sucesso</p>
                  <p className="text-xs text-gray-500">Pronto para enviar mensagens</p>
                </div>
              )}
              {instance.status === 'connecting' && (
                <div className="text-center p-4 mt-4">
                  {instance.qr_code ? (
                    <>
                      <p className="text-sm text-yellow-600 font-medium mb-2">
                        Escaneie o QR code para conectar ao WhatsApp
                      </p>
                      {instance.qr_code.startsWith('data:image/') ? (
                        <img
                          src={instance.qr_code}
                          alt="WhatsApp QR Code"
                          className="mx-auto"
                          style={{ maxWidth: '200px' }}
                        />
                      ) : (
                        <QRCodeCanvas value={instance.qr_code} size={200} level="H" />
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Abra o WhatsApp no seu celular, vá para Configurações, Aparelhos Conectados e escaneie este QR code.
                      </p>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-8 h-8 text-yellow-600 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-yellow-600 font-medium">Aguardando QR code...</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Se o QR code não aparecer em 10 segundos, tente verificar a instância ou criar uma nova.
                      </p>
                    </>
                  )}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID da Instância:</span>
                  <span className="text-gray-900 font-mono">{instance.api_key}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {instances.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma Instância WhatsApp</h3>
            <p className="text-gray-500 mb-4">Crie sua primeira instância WhatsApp para começar a automatizar comunicações</p>
            <CustomButton onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Seu Primeiro Canal
            </CustomButton>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppChannels;