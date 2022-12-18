uniform vec3 uColor;

varying vec3 vVertex;

void main()
{
    // calculcate the normal vectors
    vec3 N = normalize( cross( dFdx( vVertex ), dFdy( vVertex ) ) );

    // arbitrary direction of the light
    const vec3 lightDir = vec3( 1., 0., -1. );

    vec3 L = normalize( lightDir );
    vec3 diffuse = uColor * max( dot( N, -L ), 0.0 );

    gl_FragColor = vec4( diffuse, 1.0 );
}