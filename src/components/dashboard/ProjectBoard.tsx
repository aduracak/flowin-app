import { useParams } from 'react-router-dom';
import KanbanBoard from '../kanban/KanbanBoard';

export default function ProjectBoard() {
  const { projectId } = useParams();

  return <KanbanBoard projectId={projectId} />;
}
