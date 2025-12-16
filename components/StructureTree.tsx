import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { StructureNode } from '../types';

interface Props {
  data: StructureNode;
}

export const StructureTree: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = Math.max(400, width * 0.6);
    
    const margin = { top: 20, right: 120, bottom: 20, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create Hierarchy
    const root = d3.hierarchy(data);
    
    // Create Tree Layout (Horizontal)
    const treeLayout = d3.tree<StructureNode>().size([innerHeight, innerWidth]);
    treeLayout(root);

    // Color logic
    const getColor = (type: string) => {
        switch(type) {
            case 'root': return '#3b82f6'; // blue-500
            case 'main_point': return '#10b981'; // emerald-500
            case 'sub_point': return '#8b5cf6'; // violet-500
            case 'conclusion': return '#f59e0b'; // amber-500
            default: return '#64748b'; // slate-500
        }
    };

    // Draw Links
    svg.selectAll('path.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<StructureNode>, d3.HierarchyPointNode<StructureNode>>()
        .x(d => d.y)
        .y(d => d.x)
      )
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1') // slate-300
      .attr('stroke-width', 2)
      .attr('class', 'stroke-slate-300 dark:stroke-slate-600');

    // Draw Nodes
    const nodes = svg.selectAll('g.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Node Circles
    nodes.append('circle')
      .attr('r', 6)
      .attr('fill', d => getColor(d.data.type || 'sub_point'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Node Labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -12 : 12)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => {
          // Truncate long names
          const name = d.data.name;
          return name.length > 15 ? name.substring(0, 15) + '...' : name;
      })
      .attr('class', 'text-xs font-medium fill-slate-700 dark:fill-slate-200 pointer-events-none');
    
    // Add simple tooltip using title attribute for now
    nodes.append('title')
        .text(d => `${d.data.name}\n${d.data.description || ''}`);

  }, [data]);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
       <div className="p-4 border-b border-slate-100 dark:border-slate-700">
           <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                </svg>
               逻辑结构图
           </h3>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">展示文章的核心论点与逻辑流向</p>
       </div>
       <svg ref={svgRef} className="w-full block"></svg>
    </div>
  );
};
