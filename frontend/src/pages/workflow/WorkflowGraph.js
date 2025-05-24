import React, { useCallback, useRef } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Composant personnalisé pour simuler un graphe de workflow
// Dans une application réelle, nous utiliserions ReactFlow ou une bibliothèque similaire
const GraphContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  '& .node': {
    position: 'absolute',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: theme.shadows[3],
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '220px',
    minHeight: '80px',
    '&:hover': {
      boxShadow: theme.shadows[8],
      transform: 'translateY(-3px)',
      zIndex: 10
    }
  },
  '& .edge': {
    position: 'absolute',
    height: '2px',
    backgroundColor: theme.palette.divider,
    transformOrigin: '0 0',
    zIndex: 0
  },
  '& .edge-label': {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: '3px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'medium',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    whiteSpace: 'nowrap',
    zIndex: 1
  },
  '& .document-node': {
    backgroundColor: '#e3f2fd',
    border: '2px solid #90caf9',
    borderLeft: '8px solid #1976d2'
  },
  '& .delivery-node': {
    backgroundColor: '#f1f8e9',
    border: '2px solid #aed581',
    borderLeft: '8px solid #7cb342'
  },
  '& .validation-node': {
    backgroundColor: '#fff3e0',
    border: '2px solid #ffb74d',
    borderLeft: '8px solid #f57c00'
  },
  '& .part-node': {
    backgroundColor: '#e8eaf6',
    border: '2px solid #9fa8da',
    borderLeft: '8px solid #3f51b5'
  },
  '& .status-indicator': {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '5px'
  },
  '& .status-approved': {
    backgroundColor: theme.palette.success.main
  },
  '& .status-pending': {
    backgroundColor: theme.palette.warning.main
  },
  '& .status-rejected': {
    backgroundColor: theme.palette.error.main
  },
  '& .status-completed': {
    backgroundColor: theme.palette.success.main
  }
}));

const WorkflowGraph = ({ data, zoom, filter, search }) => {
  const containerRef = useRef(null);
  
  // Fonction pour calculer la position des arêtes avec courbe de Bézier
  const calculateEdge = (source, target, edgeType) => {
    const sourceNode = data.nodes.find(n => n.id === source);
    const targetNode = data.nodes.find(n => n.id === target);
    
    if (!sourceNode || !targetNode) return null;
    
    // Largeur et hauteur des nœuds
    const nodeWidth = 220;
    const nodeHeight = 80;
    
    // Position de départ et d'arrivée
    const startX = sourceNode.position.x + nodeWidth / 2;
    const startY = sourceNode.position.y + nodeHeight;
    const endX = targetNode.position.x + nodeWidth / 2;
    const endY = targetNode.position.y;
    
    // Calcul de la longueur et de l'angle de l'arête
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Déterminer le type d'arête à dessiner
    let edgeStyle;
    if (edgeType === 'smoothstep') {
      // Pour les arêtes courbes, on utilise une approche différente
      // On crée un chemin SVG plutôt qu'une simple ligne rotative
      const controlPointX1 = startX;
      const controlPointY1 = startY + (endY - startY) / 3;
      const controlPointX2 = endX;
      const controlPointY2 = endY - (endY - startY) / 3;
      
      const svgPath = `M${startX},${startY} C${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${endX},${endY}`;
      
      edgeStyle = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none'
      };
      
      // Position du label (au milieu de la courbe)
      const labelX = (startX + endX) / 2;
      const labelY = (startY + endY) / 2;
      
      return { 
        svgPath,
        edgeStyle,
        labelStyle: {
          left: `${labelX - 50}px`,
          top: `${labelY - 10}px`
        }
      };
    } else {
      // Position et style de l'arête droite (fallback)
      const style = {
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${length}px`,
        transform: `rotate(${angle}deg)`
      };
      
      // Position du label (au milieu de l'arête)
      const labelStyle = {
        left: `${startX + dx / 2 - 50}px`,
        top: `${startY + dy / 2 - 10}px`
      };
      
      return { style, labelStyle };
    }
  };
  
  // Fonction pour filtrer les nœuds selon les critères
  const filterNodes = useCallback(() => {
    if (!data) return [];
    
    let filteredNodes = [...data.nodes];
    
    // Filtrer par catégorie
    if (filter !== 'all') {
      const typeMap = {
        'document': 'documentNode',
        'delivery': 'deliveryNode',
        'validation': 'validationNode',
        'part': 'partNode'
      };
      filteredNodes = filteredNodes.filter(node => node.type === typeMap[filter]);
    }
    
    // Filtrer par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNodes = filteredNodes.filter(node => 
        node.data.label.toLowerCase().includes(searchLower) ||
        (node.data.category && node.data.category.toLowerCase().includes(searchLower)) ||
        (node.data.partNumber && node.data.partNumber.toLowerCase().includes(searchLower))
      );
    }
    
    return filteredNodes;
  }, [data, filter, search]);
  
  // Fonction pour filtrer les arêtes selon les nœuds filtrés
  const filterEdges = useCallback(() => {
    if (!data) return [];
    
    const filteredNodes = filterNodes();
    const nodeIds = filteredNodes.map(node => node.id);
    
    return data.edges.filter(edge => 
      nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
    );
  }, [data, filterNodes]);
  
  // Rendu du graphe
  const renderGraph = () => {
    if (!data) return null;
    
    const filteredNodes = filterNodes();
    const filteredEdges = filterEdges();
    
    return (
      <>
        {/* Rendu des arêtes avec SVG pour les courbes */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
          {filteredEdges.map(edge => {
            const edgePositions = calculateEdge(edge.source, edge.target, edge.type);
            if (!edgePositions || !edgePositions.svgPath) return null;
            
            return (
              <path
                key={edge.id}
                d={edgePositions.svgPath}
                stroke={edge.animated ? '#1976d2' : '#757575'}
                strokeWidth="2"
                fill="none"
                strokeDasharray={edge.animated ? "5,5" : "none"}
              />
            );
          })}
        </svg>
        
        {/* Rendu des arêtes classiques (fallback) */}
        {filteredEdges.map(edge => {
          const edgePositions = calculateEdge(edge.source, edge.target, edge.type);
          if (!edgePositions || !edgePositions.style) return null;
          
          return (
            <React.Fragment key={edge.id}>
              <div 
                className={`edge ${edge.animated ? 'animated-edge' : ''}`} 
                style={edgePositions.style}
              />
            </React.Fragment>
          );
        })}
        
        {/* Rendu des labels d'arêtes */}
        {filteredEdges.map(edge => {
          const edgePositions = calculateEdge(edge.source, edge.target, edge.type);
          if (!edgePositions || !edgePositions.labelStyle || !edge.label) return null;
          
          return (
            <div key={`label-${edge.id}`} className="edge-label" style={edgePositions.labelStyle}>
              {edge.label}
            </div>
          );
        })}
        
        {/* Rendu des nœuds */}
        {filteredNodes.map(node => {
          const nodeTypeClass = node.type.replace('Node', '-node');
          const nodeStyle = {
            left: `${node.position.x * zoom}px`,
            top: `${node.position.y * zoom}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          };
          
          let statusIndicator = null;
          if (node.data.status) {
            statusIndicator = (
              <span className={`status-indicator status-${node.data.status}`} />
            );
          }
          
          return (
            <div 
              key={node.id} 
              className={`node ${nodeTypeClass}`}
              style={nodeStyle}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                {statusIndicator}
                {node.data.label}
              </div>
              
              {node.type === 'documentNode' && (
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '4px' }}><strong>Catégorie:</strong> {node.data.category}</div>
                  <div><strong>État:</strong> {node.data.status}</div>
                </div>
              )}
              
              {node.type === 'deliveryNode' && (
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '4px' }}><strong>Date:</strong> {node.data.date}</div>
                  <div><strong>Responsable:</strong> {node.data.responsible}</div>
                </div>
              )}
              
              {node.type === 'validationNode' && (
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '4px' }}><strong>État:</strong> {node.data.status}</div>
                  <div><strong>Validateur:</strong> {node.data.validator}</div>
                </div>
              )}
              
              {node.type === 'partNode' && (
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '4px' }}><strong>Référence:</strong> {node.data.partNumber}</div>
                  <div><strong>N° série:</strong> {node.data.serialNumber}</div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };
  
  return (
    <GraphContainer ref={containerRef}>
      {renderGraph()}
    </GraphContainer>
  );
};

export default WorkflowGraph;
