precision highp int;
varying vec3 vVertex;



float hash( uvec2 x )
{
    uvec2 q = 1103515245U * ( ( x>>1U ) ^ ( x.yx ) );
    uint  n = 1103515245U * ( ( q.x   ) ^ ( q.y>>3U ) );
    return float( n ) * ( 1.0 / float( 0xffffffffU ) );
}

float noise( vec2 p ){
    uvec2 ip = uvec2( floor( p ) );
    vec2 u = fract( p );
    u = u * u * ( 3.0 - 2.0 * u );
	
    float res = mix(
		mix( hash( ip ), hash( ip + uvec2( 1, 0 ) ), u.x ),
		mix( hash( ip + uvec2( 0, 1 ) ), hash( ip + uvec2( 1,1 ) ), u.x ), u.y );
    return res * res;
}

float fBm( vec2 p, int octaves, float lacunarity, float gain ) {
    float freq = 1.0;
    float amp = 0.5;
    float sum = 0.;
    for( int i = 0; i < octaves; i++ ) {
        sum += noise( p * freq ) * amp;
        freq *= lacunarity;
        amp *= gain;
    }
    return sum;
}




void main() {
    vec3 p = position;

    if ( p.x < 256. && p.x > -256. && p.y < 256. && p.y > -256. ) {
        float f = fBm( uv * 4., 3, 4., 0.2 );
        f = fBm( vec2( uv.x * f, uv.y * f ) * 3.9 + vec2( 92.4, 0.221 ), 2, 1.1, 1.9 );
        f = fBm( vec2( uv.x * f, uv.y * f ) * 1.3 + vec2( 1.4, 3.221 ), 3, 2.2, 1.1 );

        p.z = f * 100.;
    }

     vVertex = ( modelViewMatrix * vec4( p, 1. )).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1. );
}