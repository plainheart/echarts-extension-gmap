declare const name = 'echarts-extension-gmap'
declare const version = '1.6.0'

interface InnerGoogleMapComponentOption {
  /**
   * The zIndex of echarts layer for Google Map.
   * @default 2000
   */
  echartsLayerZIndex?: number
  /**
   * Whether echarts layer should be rendered when the map is moving.
   * if `false`, it will only be re-rendered after the map `moveend`.
   * It's better to set this option to false if data is large.
   * @default true
   */
  renderOnMoving?: boolean
  /**
   * Whether to enable gesture handling.
   * @default true
   * @since v1.4.0
   */
  roam?: boolean
}

/**
 * Extended Google Map component option
 */
interface GoogleMapComponentOption<GoogleMapOption> {
  gmap?: GoogleMapOption extends never
    ? InnerGoogleMapComponentOption
    : InnerGoogleMapComponentOption & GoogleMapOption
}

export { name, version, GoogleMapComponentOption }
