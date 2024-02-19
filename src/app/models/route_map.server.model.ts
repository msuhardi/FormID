import { MongoError } from 'mongodb'
import { CallbackError, Mongoose, Schema } from 'mongoose'

import { ActionRoutingType, ActionStepType } from '../../../shared/types'
import { IRouteMap, IRouteMapModel } from '../../types/route_map'

export const ROUTE_MAP_SCHEMA_ID = 'RouteMap'

const compileRouteMapModel = (db: Mongoose) => {
  let RouteStep = {}
  const RouteMap: Schema<IRouteMap, IRouteMapModel> = new Schema()
  RouteStep = {
    routeMap: RouteMap,
    type: {
      type: String,
      enum: Object.values(ActionStepType),
    },
    routingType: {
      type: String,
      enum: Object.values(ActionRoutingType),
    },
    emails: [String],
    emailField: String,
    checkboxField: {
      question: String,
      rules: [
        {
          answer: String,
          emails: [String],
        },
      ],
    },
    question: String,
    rules: [
      {
        conditionStep: String,
        answer: String,
        nextStep: RouteStep,
      },
    ],
    approvalStep: RouteStep,
    rejectionStep: RouteStep,
  }
  RouteMap.add({
    active: Boolean,
    respondentEmailField: String,
    trigger: RouteStep,
    emailSender: String,
    isDecisionPublic: Boolean,
  })

  RouteMap.post<IRouteMap>(
    'save',
    function (err: Error, _doc: unknown, next: (err?: CallbackError) => void) {
      if (err) {
        if (err.name === 'MongoError' && (err as MongoError)?.code === 11000) {
          next(err)
        } else {
          next(err)
        }
      } else {
        next()
      }
    },
  )

  RouteMap.statics.upsertRouteMap = async function (upsertParams: IRouteMap) {
    return this.findOneAndUpdate(
      { _id: upsertParams.id },
      { $set: upsertParams },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    )
  }

  return db.model<IRouteMap, IRouteMapModel>(ROUTE_MAP_SCHEMA_ID, RouteMap)
}

const getRouteMapModel = (db: Mongoose): IRouteMapModel => {
  try {
    return db.model(ROUTE_MAP_SCHEMA_ID) as IRouteMapModel
  } catch {
    return compileRouteMapModel(db)
  }
}

export default getRouteMapModel
