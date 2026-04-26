
async function testLineageData() {
  try {
    const fqn = 'acme_nexus_silver_data.acme_silver.core.dim_product';
    const res = await fetch(`http://localhost:3000/api/metadata?type=lineage&fqn=${encodeURIComponent(fqn)}`);
    const data = await res.json();
    console.log('Target:', data.entity.name);
    console.log('Nodes count:', data.nodes.length);
    console.log('Upstream edges:', data.upstreamEdges.length);
    console.log('Downstream edges:', data.downstreamEdges.length);
    
    const upstream = data.nodes.filter(n => data.upstreamEdges.some(e => e.fromEntity?.id === n.id));
    const downstream = data.nodes.filter(n => data.downstreamEdges.some(e => e.toEntity?.id === n.id));
    console.log('Resolved Upstream Nodes:', upstream.length);
    console.log('Resolved Downstream Nodes:', downstream.length);
    
    if (upstream.length > 0 || downstream.length > 0) {
      console.log('✅ Lineage logic fixed!');
    } else if (data.upstreamEdges.length > 0 || data.downstreamEdges.length > 0) {
      console.log('❌ Logic still failing.');
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
testLineageData();
