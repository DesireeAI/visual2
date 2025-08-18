import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableItem } from '@/components/leads/SortableItem';
import { Lead } from '@/types';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/CustomButton';
import { toast } from 'react-toastify';

interface KanbanColumn {
  id: Lead['status'];
  title: string;
}

const columns: KanbanColumn[] = [
  { id: 'new', title: 'Agendado' },
  { id: 'in-attendance', title: 'Em Atendimento' },
  { id: 'contacted', title: 'Concluído' },
  { id: 'no-show', title: 'Não Compareceu' },
  { id: 'to-reschedule', title: 'A Reagendar' },
   { id: 'canceled', title: 'Cancelado' },
];

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg shadow-md p-4 min-w-[250px] min-h-[300px] ${isOver ? 'border-2 border-blue-500' : ''}`}
    >
      {children}
    </div>
  );
};

export const KanbanBoard: React.FC = () => {
  const { fetchLeads, updateLead, loading, error } = useApi();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [previewLeads, setPreviewLeads] = useState<Lead[]>([]);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [lastOverColumn, setLastOverColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadLeads = useCallback(async () => {
    try {
      console.log('Fetching leads from API...');
      const data = await fetchLeads();
      console.log('Fetched leads:', data);
      setLeads(data || []);
      setPreviewLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Falha ao carregar leads: ' + (err.message || 'Erro desconhecido'));
    }
  }, [fetchLeads]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id);
    setDraggingLeadId(event.active.id as string);
    setLastOverColumn(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    if (columns.some(column => column.id === overId)) {
      console.log(`Preview: Moving lead ${activeLeadId} to ${overId}`);
      setLastOverColumn(overId);
      setPreviewLeads(prev =>
        prev.map(lead =>
          lead.id === activeLeadId ? { ...lead, status: overId as Lead['status'] } : lead
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active: active?.id, over: over?.id });

    setDraggingLeadId(null);

    if (!over) {
      console.log('No over item, resetting preview to leads');
      setPreviewLeads(leads);
      setLastOverColumn(null);
      return;
    }

    const activeLeadId = active.id as string;
    const overId = over.id as string;
    const targetColumn = columns.some(column => column.id === overId) ? overId : lastOverColumn;

    if (targetColumn && columns.some(column => column.id === targetColumn)) {
      const lead = leads.find(l => l.id === activeLeadId);
      if (!lead) {
        console.error(`Lead not found: ${activeLeadId}`);
        setPreviewLeads(leads);
        setLastOverColumn(null);
        toast.error('Lead não encontrado');
        return;
      }

      if (lead.status === targetColumn) {
        console.log(`Lead ${activeLeadId} already in ${targetColumn}, resetting preview`);
        setPreviewLeads(leads);
        setLastOverColumn(null);
        return;
      }

      // Confirmation prompt for 'contacted' (Concluído) status
      if (targetColumn === 'contacted') {
        const confirmMove = window.confirm(
          `Tem certeza que deseja mover o lead "${lead.clientName}" para o status Concluído?`
        );
        if (!confirmMove) {
          console.log(`Move to Concluído cancelled for lead ${activeLeadId}`);
          setPreviewLeads(leads);
          setLastOverColumn(null);
          return;
        }
      }

      // Optimistic update
      console.log(`Optimistically updating lead ${activeLeadId} to ${targetColumn}`);
      setLeads(prev =>
        prev.map(l => (l.id === activeLeadId ? { ...l, status: targetColumn as Lead['status'] } : l))
      );
      setPreviewLeads(prev =>
        prev.map(l => (l.id === activeLeadId ? { ...l, status: targetColumn as Lead['status'] } : l))
      );

      try {
        setIsUpdating(activeLeadId);
        console.log(`Attempting to update lead ${activeLeadId} to status ${targetColumn}`);
        const updatedLead = await updateLead(activeLeadId, { status: targetColumn as Lead['status'] });
        console.log('Lead updated:', updatedLead);
        setLeads(prev =>
          prev.map(l => (l.id === activeLeadId ? { ...l, status: updatedLead.status } : l))
        );
        setPreviewLeads(prev =>
          prev.map(l => (l.id === activeLeadId ? { ...l, status: updatedLead.status } : l))
        );
        toast.success(`Lead ${lead.clientName} movido para ${columns.find(c => c.id === targetColumn)?.title}`);
        console.log(`Lead ${activeLeadId} successfully moved to ${targetColumn}`);
      } catch (err: unknown) {
        console.error('Error updating lead:', err);
        setLeads(prev =>
          prev.map(l => (l.id === activeLeadId ? { ...l, status: lead.status } : l))
        );
        setPreviewLeads(prev =>
          prev.map(l => (l.id === activeLeadId ? { ...l, status: lead.status } : l))
        );
        toast.error(`Falha ao atualizar o status do lead: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      } finally {
        setIsUpdating(null);
      }
    } else {
      // Reorder within the same column
      const activeLead = leads.find(l => l.id === activeLeadId);
      const overLead = leads.find(l => l.id === overId);
      if (activeLead && overLead && activeLead.status === overLead.status) {
        const oldIndex = leads.findIndex(l => l.id === activeLeadId);
        const newIndex = leads.findIndex(l => l.id === overId);
        console.log(`Reordering lead ${activeLeadId} within ${activeLead.status} column`);
        const newLeads = arrayMove(leads, oldIndex, newIndex);
        setLeads(newLeads);
        setPreviewLeads(newLeads);
      } else {
        console.log('No reorder or column move: invalid drop');
        setPreviewLeads(leads);
      }
    }

    setLastOverColumn(null);
  };

  if (loading && leads.length === 0) {
    return (
      <div className="p-6 text-center">
        <span className="text-gray-600">Carregando leads...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Erro: {error}
        <CustomButton className="mt-4" onClick={loadLeads}>
          Tentar novamente
        </CustomButton>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        Nenhum lead encontrado. Por favor, adicione leads ao sistema.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quadro Kanban</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-row gap-4 overflow-x-auto">
          {columns.map(column => (
            <DroppableColumn key={column.id} id={column.id}>
              <Card className="h-full">
                <CardHeader className="bg-blue-100">
                  <CardTitle className="text-lg font-semibold">{column.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <SortableContext
                    id={column.id}
                    items={previewLeads.filter(lead => lead.status === column.id).map(lead => lead.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {previewLeads
                      .filter(lead => lead.status === column.id)
                      .map(lead => (
                        <SortableItem key={lead.id} id={lead.id}>
                          <div
                            className={`p-3 mb-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                              draggingLeadId === lead.id || isUpdating === lead.id ? 'opacity-50' : ''
                            }`}
                          >
                            <h3 className="font-medium text-gray-900">{lead.clientName}</h3>
                            <p className="text-sm text-gray-500">{lead.phone || 'Sem telefone'}</p>
                            <p className="text-sm text-gray-500">
                              {lead.appointmentDate && lead.appointmentTime
                                ? `${lead.appointmentDate} ${lead.appointmentTime}`
                                : 'Sem agendamento'}
                            </p>
                            {lead.notes && <p className="text-sm text-gray-500 mt-1">{lead.notes}</p>}
                          </div>
                        </SortableItem>
                      ))}
                    {previewLeads.filter(lead => lead.status === column.id).length === 0 && (
                      <div className="text-center text-gray-500 text-sm">Nenhum lead nesta coluna</div>
                    )}
                  </SortableContext>
                </CardContent>
              </Card>
            </DroppableColumn>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;