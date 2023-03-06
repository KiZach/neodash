import React, { useRef } from 'react';
import ForceGraph2D, { LinkObject } from 'react-force-graph-2d';
import { actionRule } from '../../extensions/actions/ActionsRule';
import { getRuleWithFieldPropertyName } from '../../extensions/advancedcharts/Utils';
import { getTooltip } from './component/GraphChartTooltip';
import { GraphChartVisualizationProps } from './GraphChartVisualization';
import { generateNodeCanvasObject } from './util/NodeUtils';
import { generateRelCanvasObject, selfLoopRotationDegrees } from './util/RelUtils';

export const NeoGraphChartVisualization2D = (props: GraphChartVisualizationProps) => {
  const fgRef = useRef();

  if (!props.style.width || !props.style.height) {
    return <></>;
  }
  props.interactivity.zoomToFit = () => fgRef.current.zoomToFit(400);

  return (
    <ForceGraph2D
      ref={fgRef}
      width={props.style.width - 20}
      height={props.style.height - 10}
      linkCurvature='curvature'
      backgroundColor={props.style.backgroundColor}
      linkDirectionalArrowLength={3}
      linkDirectionalArrowRelPos={1}
      dagMode={props.engine.layout}
      linkWidth={(link: any) => link.width}
      linkLabel={(link: any) => (props.interactivity.showPropertiesOnHover ? `<div>${getTooltip(link)}</div>` : '')}
      nodeLabel={(node: any) => (props.interactivity.showPropertiesOnHover ? `<div>${getTooltip(node)}</div>` : '')}
      nodeVal={(node: any) => node.size}
      onNodeClick={(item) => {
        let rules = getRuleWithFieldPropertyName(item, props.extensions.actionsRules, 'onNodeClick', 'labels');
        rules != null
          ? rules.forEach((rule) => actionRule(rule, item, props.interactivity.setGlobalParameter))
          : props.interactivity.onNodeClick(item);
      }}
      onLinkClick={(item) => {
        let rules = getRuleWithFieldPropertyName(item, props.extensions.actionsRules, 'onLinkClick', 'type');
        rules != null
          ? rules.forEach((rule) => actionRule(rule, item, props.interactivity.setGlobalParameter))
          : props.interactivity.onRelationshipClick(item);
      }}
      onNodeRightClick={(node, event) => props.interactivity.onNodeRightClick(node, event)}
      onLinkRightClick={(link, event) => props.interactivity.onRelationshipRightClick(link, event)}
      onBackgroundClick={() => props.interactivity.onNodeClick(undefined)}
      onBackgroundRightClick={() => props.interactivity.onNodeClick(undefined)}
      linkLineDash={(link) => (link.new ? [2, 1] : null)}
      linkDirectionalParticleSpeed={props.style.linkDirectionalParticleSpeed}
      cooldownTicks={props.engine.cooldownTicks}
      onEngineStop={() => {
        props.engine.setCooldownTicks(0);
        if (props.engine.recenterAfterEngineStop) {
          fgRef.current.zoomToFit(400);
          props.engine.setRecenterAfterEngineStop(false);
        }
      }}
      onZoom={() => {
        props.interactivity.setContextMenuOpen(false);
      }}
      onNodeDrag={() => {
        props.interactivity.setContextMenuOpen(false);
        props.engine.setCooldownTicks(1);
        props.engine.setRecenterAfterEngineStop(false);
      }}
      onNodeDragEnd={(node) => {
        props.engine.setCooldownTicks(0);
        if (props.interactivity.fixNodeAfterDrag) {
          node.fx = node.x;
          node.fy = node.y;
        }
        if (props.interactivity.layoutFrozen) {
          const key = node.id;
          const val = [node.x, node.y];
          const old = { ...props.interactivity.nodePositions };
          old[key] = val;
          props.interactivity.setNodePositions(old);
        }
      }}
      nodeCanvasObjectMode={() => 'after'}
      nodeCanvasObject={(node: any, ctx: any) =>
        generateNodeCanvasObject(
          node,
          ctx,
          props.style.nodeIcons,
          props.interactivity.layoutFrozen,
          props.interactivity.nodePositions,
          props.style.nodeLabelFontSize,
          props.style.defaultNodeSize,
          props.style.nodeLabelColor,
          props.extensions.styleRules,
          props.engine.selection
        )
      }
      linkCanvasObjectMode={() => 'after'}
      linkCanvasObject={(link: any, ctx: any) =>
        generateRelCanvasObject(link, ctx, props.style.relLabelFontSize, props.style.relLabelColor)
      }
      graphData={props.style.width ? { nodes: props.data.nodes, links: props.data.links } : { nodes: [], links: [] }}
    />
  );
};
