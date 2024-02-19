import { Document, Model } from 'mongoose'

import { FormRouteMap } from '../../shared/types'

export interface IRouteMap extends FormRouteMap, Document {}

export interface IPopulatedRouteMap extends IRouteMap {
  _id: any
}

export interface IRouteMapModel extends Model<IRouteMap> {
  upsertRouteMap: (upsertParams: IRouteMap) => Promise<IPopulatedRouteMap>
}
